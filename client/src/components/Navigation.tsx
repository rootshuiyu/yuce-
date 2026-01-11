import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { TrendingUp, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity">
            <TrendingUp className="w-6 h-6" />
            <span>Super Truth</span>
          </a>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/">
            <a className="text-foreground hover:text-primary transition-colors">
              市场
            </a>
          </Link>
          <a href="#" className="text-foreground hover:text-primary transition-colors">
            排行榜
          </a>
          <a href="#" className="text-foreground hover:text-primary transition-colors">
            关于
          </a>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="outline" size="sm">
            连接钱包
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container px-4 py-4 flex flex-col gap-4">
            <Link href="/">
              <a className="text-foreground hover:text-primary transition-colors">
                市场
              </a>
            </Link>
            <a href="#" className="text-foreground hover:text-primary transition-colors">
              排行榜
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors">
              关于
            </a>
            <Button variant="outline" size="sm" className="w-full">
              连接钱包
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
