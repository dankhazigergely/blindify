<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SpotifyController;

Route::prefix('auth')->group(function () {
    Route::get('login-url', [AuthController::class, 'getLoginUrl']);
    Route::post('token', [AuthController::class, 'exchangeToken']);
    Route::post('refresh', [AuthController::class, 'refreshAccessToken']);
    Route::post('logout', [AuthController::class, 'logout']);
});

Route::prefix('spotify')->group(function () {
    Route::get('playlists', [SpotifyController::class, 'getPlaylists']);
    Route::get('playlist/{playlist_id}/tracks', [SpotifyController::class, 'getPlaylistTracks']);
    Route::get('track/{track_id}', [SpotifyController::class, 'getTrackDetails']);
    Route::get('user', [SpotifyController::class, 'getUserProfile']);
});