/**
 * Page footer with branding and theme selector
 * Shows copyright info and allows users to switch color themes
 */
export default function PageFooter() {
  return (
    <footer className="mt-12 pt-6 border-t border-gray-300">
      <div className="flex items-center justify-between text-sm text-[#5a5a5a]">
        <p>© 2025 MNSUAM — Faculty Dashboard (Mock)</p>
        
        {/* Theme selector - currently static, could be made interactive */}
        <div className="flex items-center gap-4">
          <span>Theme:</span>
          <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="w-4 h-4 rounded-full bg-[#2d6a4f] border-2 border-[#1a1a1a]"></span>
            <span>Green</span>
          </button>
          <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="w-4 h-4 rounded-full bg-[#c9a961] border-2 border-[#1a1a1a]"></span>
            <span>Gold</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
