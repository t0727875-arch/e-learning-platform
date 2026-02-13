<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

final class AuthController
{
    #[Route('/api/subscribe', name: 'api_subscribe', methods: ['POST'])]
    public function subscribe(Request $request): JsonResponse
    {
        $payload = json_decode($request->getContent(), true);
        $email = $payload['email'] ?? null;

        if (!is_string($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['message' => 'Invalid email address'], 422);
        }

        // TODO: Wire this to Doctrine + user/profile entities.
        return new JsonResponse([
            'success' => true,
            'message' => 'Successfully subscribed',
            'email' => $email,
            'note' => 'Persistence and OAuth handlers are pending migration from Node API.',
        ]);
    }

    #[Route('/api/auth/google', name: 'api_auth_google', methods: ['GET'])]
    public function googleRedirect(): JsonResponse
    {
        return new JsonResponse([
            'message' => 'Google OAuth redirect endpoint placeholder for Symfony implementation.',
        ], 501);
    }
}
