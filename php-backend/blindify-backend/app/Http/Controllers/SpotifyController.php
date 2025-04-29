<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\SpotifyService;

class SpotifyController extends Controller
{
    public function getPlaylists(Request $request)
    {
        $accessToken = $request->query('access_token');
        $service = new SpotifyService($accessToken);
        return response()->json($service->getUserPlaylists());
    }

    public function getPlaylistTracks($playlist_id, Request $request)
    {
        $accessToken = $request->query('access_token');
        $service = new SpotifyService($accessToken);
        return response()->json($service->getPlaylistTracks($playlist_id));
    }

    public function getTrackDetails($track_id, Request $request)
    {
        $accessToken = $request->query('access_token');
        $service = new SpotifyService($accessToken);
        return response()->json($service->getTrackDetails($track_id));
    }

    public function getUserProfile(Request $request)
    {
        $accessToken = $request->query('access_token');
        $service = new SpotifyService($accessToken);
        return response()->json($service->getUserProfile());
    }
}