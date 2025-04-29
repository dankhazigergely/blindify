<?php

// config/spotify.php
return [
    'client_id' => env('SPOTIFY_CLIENT_ID'),
    'client_secret' => env('SPOTIFY_CLIENT_SECRET'),
    'redirect_uri' => env('SPOTIFY_REDIRECT_URI', 'http://127.0.0.1:5000/callback'),
    'scopes' => [
        'user-read-private',
        'user-read-email',
        'playlist-read-private',
        'playlist-read-collaborative',
        'user-modify-playback-state',
        'user-read-playback-state',
        'streaming',
    ],
    'api_base_url' => 'https://api.spotify.com/v1',
    'auth_base_url' => 'https://accounts.spotify.com',
    'token_encryption_key' => env('TOKEN_ENCRYPTION_KEY'),
];