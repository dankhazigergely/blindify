<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

class AuthController extends Controller
{
    public function getLoginUrl()
    {
        $clientId = config('spotify.client_id');
        $redirectUri = config('spotify.redirect_uri');
        $scopes = implode(' ', config('spotify.scopes'));
        $authBaseUrl = config('spotify.auth_base_url');

        $params = http_build_query([
            'client_id' => $clientId,
            'response_type' => 'code',
            'redirect_uri' => $redirectUri,
            'scope' => $scopes,
            'show_dialog' => 'true',
        ]);

        $authUrl = "$authBaseUrl/authorize?$params";
        return response()->json(['login_url' => $authUrl]);
    }

    public function exchangeToken(Request $request)
    {
        $clientId = config('spotify.client_id');
        $clientSecret = config('spotify.client_secret');
        $redirectUri = config('spotify.redirect_uri');
        $authBaseUrl = config('spotify.auth_base_url');

        $code = $request->input('code');
        $headers = [
            'Authorization' => 'Basic ' . base64_encode("$clientId:$clientSecret"),
            'Content-Type' => 'application/x-www-form-urlencoded',
        ];
        $data = [
            'grant_type' => 'authorization_code',
            'code' => $code,
            'redirect_uri' => $redirectUri,
        ];
        $response = Http::withHeaders($headers)
            ->asForm()
            ->post("$authBaseUrl/api/token", $data);
        
        if (!$response->ok()) {
            return response()->json(['error' => 'Token exchange failed'], $response->status());
        }
        $tokenInfo = $response->json();
        $userId = substr($tokenInfo['refresh_token'] ?? '', 0, 10);
        $encryptedRefreshToken = Crypt::encryptString($tokenInfo['refresh_token'] ?? '');
        // Itt: célszerű adatbázisban tárolni a refresh token-t, most session-ben
        session(["refresh_tokens.$userId" => $encryptedRefreshToken]);
        return response()->json([
            'access_token' => $tokenInfo['access_token'],
            'expires_in' => $tokenInfo['expires_in'],
            'user_id' => $userId,
        ]);
    }

    public function refreshAccessToken(Request $request)
    {
        $clientId = config('spotify.client_id');
        $clientSecret = config('spotify.client_secret');
        $authBaseUrl = config('spotify.auth_base_url');
        $userId = $request->input('user_id');
        $encryptedRefreshToken = session("refresh_tokens.$userId");
        if (!$encryptedRefreshToken) {
            return response()->json(['error' => 'No refresh token found. Please log in again.'], 401);
        }
        $refreshToken = Crypt::decryptString($encryptedRefreshToken);
        $headers = [
            'Authorization' => 'Basic ' . base64_encode("$clientId:$clientSecret"),
            'Content-Type' => 'application/x-www-form-urlencoded',
        ];
        $data = [
            'grant_type' => 'refresh_token',
            'refresh_token' => $refreshToken,
        ];
        $response = Http::asForm()->withHeaders($headers)->post("$authBaseUrl/api/token", $data);
        if (!$response->ok()) {
            session()->forget("refresh_tokens.$userId");
            return response()->json(['error' => 'Refresh token expired. Please log in again.'], 401);
        }
        $tokenInfo = $response->json();
        if (isset($tokenInfo['refresh_token'])) {
            $encryptedRefreshToken = Crypt::encryptString($tokenInfo['refresh_token']);
            session(["refresh_tokens.$userId" => $encryptedRefreshToken]);
        }
        return response()->json([
            'access_token' => $tokenInfo['access_token'],
            'expires_in' => $tokenInfo['expires_in'],
        ]);
    }

    public function logout(Request $request)
    {
        $userId = $request->input('user_id');
        session()->forget("refresh_tokens.$userId");
        return response()->json(['message' => 'Logged out successfully']);
    }
}