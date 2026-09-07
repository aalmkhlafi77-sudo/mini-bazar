import React from 'react';
import {
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Linkedin,
  MessageCircle,
  Send,
  Globe,
} from 'lucide-react';
import { SocialPlatform } from '../types';

interface SocialIconProps {
  platform: SocialPlatform;
  className?: string;
}

export const SocialIcon: React.FC<SocialIconProps> = ({ platform, className = 'w-4 h-4' }) => {
  switch (platform) {
    case 'instagram':
      return <Instagram className={className} />;
    case 'twitter':
      return <Twitter className={className} />;
    case 'facebook':
      return <Facebook className={className} />;
    case 'youtube':
      return <Youtube className={className} />;
    case 'linkedin':
      return <Linkedin className={className} />;
    case 'whatsapp':
      return <MessageCircle className={className} />;
    case 'telegram':
      return <Send className={className} />;
    case 'tiktok':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.46V12a8.28 8.28 0 0 0 5.73 2.25V10.8a4.84 4.84 0 0 1-2.07-.84 4.8 4.8 0 0 1-1.42-1.77 4.9 4.9 0 0 1-.36-1.5z" />
        </svg>
      );
    case 'snapchat':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.002 2c-3.69 0-6.19 2.58-6.19 5.86 0 .82.23 2.05.74 2.83.13.2.06.37-.15.48-.48.25-1.5.79-1.5 1.54 0 .54.43.91.95 1.05.21.06.33.24.3.46-.07.48-.3 1.63-.56 2.05-.18.28-.42.34-.84.28-.31-.05-.67-.14-.94-.14-.4 0-.69.21-.69.51 0 .61.91 1.09 2.26 1.44.17.04.28.2.27.38-.04.42-.11 1.05.21 1.34.34.31 1.08.3 1.83.17.29-.05.51.13.65.37.5 1.05 1.85 1.36 3.71 1.36s3.21-.31 3.71-1.36c.14-.24.36-.42.65-.37.75.13 1.49.14 1.83-.17.32-.29.25-.92.21-1.34-.01-.18.1-.34.27-.38 1.35-.35 2.26-.83 2.26-1.44 0-.3-.29-.51-.69-.51-.27 0-.63.09-.94.14-.42.06-.66 0-.84-.28-.26-.42-.49-1.57-.56-2.05-.03-.22.09-.4.3-.46.52-.14.95-.51.95-1.05 0-.75-1.02-1.29-1.5-1.54-.21-.11-.28-.28-.15-.48.51-.78.74-2.01.74-2.83 0-3.28-2.5-5.86-6.19-5.86z" />
        </svg>
      );
    case 'pinterest':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0a12 12 0 0 0-4.37 23.18c-.03-.99-.05-2.52.21-3.61l1.51-6.42s-.39-.77-.39-1.92c0-1.8 1.04-3.14 2.34-3.14 1.1 0 1.64.83 1.64 1.82 0 1.11-.71 2.76-1.07 4.3-.31 1.29.65 2.34 1.92 2.34 2.3 0 4.07-2.43 4.07-5.93 0-3.1-2.23-5.27-5.41-5.27-3.69 0-5.85 2.77-5.85 5.62 0 1.11.43 2.31.96 2.96.11.13.12.24.09.37l-.36 1.46c-.06.24-.2.29-.46.17-1.72-.8-2.79-3.32-2.79-5.34 0-4.35 3.16-8.34 9.12-8.34 4.79 0 8.51 3.41 8.51 7.97 0 4.76-3 8.58-7.16 8.58-1.4 0-2.71-.73-3.16-1.59l-.86 3.28c-.31 1.19-1.15 2.68-1.72 3.59A12 12 0 1 0 12 0z" />
        </svg>
      );
    default:
      return <Globe className={className} />;
  }
};
