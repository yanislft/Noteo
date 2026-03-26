<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends ResetPassword
{
    public function toMail($notifiable)
    {
        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173'));
        $resetUrl = $frontendUrl . '/reset-password?token=' . $this->token . '&email=' . urlencode($notifiable->getEmailForPasswordReset());

        return (new MailMessage)
            ->subject('Réinitialisation de votre mot de passe — Noteo')
            ->greeting('Bonjour ' . $notifiable->firstname . ' !')
            ->line('Vous recevez cet email car une demande de réinitialisation de mot de passe a été effectuée pour votre compte.')
            ->action('Réinitialiser mon mot de passe', $resetUrl)
            ->line('Ce lien expire dans 60 minutes.')
            ->line('Si vous n\'avez pas demandé de réinitialisation, ignorez cet email.')
            ->salutation('Cordialement, l\'équipe Noteo');
    }
}
