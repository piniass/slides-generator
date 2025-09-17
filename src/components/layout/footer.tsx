import Link from "next/link";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import { APP_CONFIG } from "../../../config";
import Logo from "@/components/ui/logo";
/**
 * Footer Component
 *
 * A comprehensive footer with:
 * - Company information and links
 * - Social media links
 * - Legal links (Privacy, Terms)
 * - Newsletter signup (placeholder)
 * - Copyright information
 *
 * @component
 */
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-900/80 border-t border-emerald-800/30 backdrop-blur-md supports-[backdrop-filter]:bg-zinc-900/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Logo size="md" showText={true} />
            <p className="text-sm text-zinc-400 max-w-xs">
              {APP_CONFIG.description}
            </p>
            <div className="flex space-x-4">
              {APP_CONFIG.social.github && (
                <Link
                  href={APP_CONFIG.social.github}
                  className="text-zinc-400 hover:text-emerald-300 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-5 w-5" />
                </Link>
              )}
              {APP_CONFIG.social.twitter && (
                <Link
                  href={APP_CONFIG.social.twitter}
                  className="text-zinc-400 hover:text-emerald-300 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="h-5 w-5" />
                </Link>
              )}
              {APP_CONFIG.social.linkedin && (
                <Link
                  href={APP_CONFIG.social.linkedin}
                  className="text-zinc-400 hover:text-emerald-300 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="h-5 w-5" />
                </Link>
              )}
              {APP_CONFIG.contact.email && (
                <Link
                  href={`mailto:${APP_CONFIG.contact.email}`}
                  className="text-zinc-400 hover:text-emerald-300 transition-colors"
                >
                  <Mail className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>

          {/* Legal Links */}
          <div className="space-y-4 md:text-right md:ml-auto">
            <h3 className="text-sm font-semibold text-zinc-100">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-zinc-400 hover:text-emerald-300 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-zinc-400 hover:text-emerald-300 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-sm text-zinc-400 hover:text-emerald-300 transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-emerald-800/30 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-zinc-400">
            © {currentYear} {APP_CONFIG.name}. All rights reserved.
          </p>
          <p className="text-sm text-zinc-400 mt-2 sm:mt-0">
            Built with Next.js, shadcn/ui, Supabase & Stripe
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
