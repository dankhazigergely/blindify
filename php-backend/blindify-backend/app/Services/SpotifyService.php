<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Config;

class SpotifyService
{
    protected $accessToken;
    protected $headers;
    protected $apiBaseUrl;

    public function __construct($accessToken)
    {
        $this->accessToken = $accessToken;
        $this->headers = [
            'Authorization' => 'Bearer ' . $accessToken,
            'Content-Type' => 'application/json',
        ];
        $this->apiBaseUrl = config('spotify.api_base_url');
    }

    protected function makeRequest($method, $endpoint, $params = [], $data = [])
    {
        $url = $this->apiBaseUrl . $endpoint;
        $request = Http::withHeaders($this->headers);
        if (strtolower($method) === 'get') {
            $response = $request->get($url, $params);
        } elseif (strtolower($method) === 'post') {
            $response = $request->post($url, $data);
        } elseif (strtolower($method) === 'put') {
            $response = $request->put($url, $data);
        } else {
            throw new \Exception('Unsupported HTTP method');
        }
        if ($response->status() >= 400) {
            $error = $response->json('error.message') ?? 'Unknown error';
            throw new \Exception("Spotify API error: $error (Status: {$response->status()})");
        }
        return $response->json();
    }

    public function getUserProfile()
    {
        return $this->makeRequest('GET', '/me');
    }

    public function getUserPlaylists($limit = 50)
    {
        $playlists = [];
        $offset = 0;
        $total = null;
        do {
            $response = $this->makeRequest('GET', '/me/playlists', [
                'limit' => $limit,
                'offset' => $offset,
            ]);
            $playlists = array_merge($playlists, $response['items']);
            $total = $response['total'];
            $offset += $limit;
        } while ($offset < $total);
        return [
            'items' => $playlists,
            'total' => $total,
        ];
    }

    public function getPlaylistTracks($playlistId, $limit = 100)
    {
        $tracks = [];
        $offset = 0;
        $total = null;
        do {
            $response = $this->makeRequest('GET', "/playlists/$playlistId/tracks", [
                'limit' => $limit,
                'offset' => $offset,
                'fields' => 'items(track(id,name,artists(name),album(name,release_date,images))),total',
            ]);
            foreach ($response['items'] as $item) {
                if (!empty($item['track'])) {
                    $track = $item['track'];
                    $tracks[] = [
                        'id' => $track['id'],
                        'name' => $track['name'],
                        'artists' => array_map(fn($a) => $a['name'], $track['artists']),
                        'album' => [
                            'name' => $track['album']['name'],
                            'release_date' => $track['album']['release_date'],
                            'images' => $track['album']['images'] ?? [],
                        ],
                        'uri' => 'spotify:track:' . $track['id'],
                    ];
                }
            }
            $total = $response['total'];
            $offset += $limit;
        } while ($offset < $total);
        return [
            'items' => $tracks,
            'total' => count($tracks),
        ];
    }

    public function getTrackDetails($trackId)
    {
        $track = $this->makeRequest('GET', "/tracks/$trackId");
        $releaseDate = $track['album']['release_date'] ?? null;
        $releaseYear = $releaseDate ? explode('-', $releaseDate)[0] : 'Unknown';
        return [
            'id' => $track['id'],
            'name' => $track['name'],
            'artists' => array_map(fn($a) => $a['name'], $track['artists']),
            'album' => [
                'name' => $track['album']['name'],
                'release_date' => $track['album']['release_date'],
                'release_year' => $releaseYear,
                'images' => $track['album']['images'],
            ],
            'uri' => 'spotify:track:' . $track['id'],
        ];
    }
}
