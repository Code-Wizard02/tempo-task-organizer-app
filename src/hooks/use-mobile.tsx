
import * as React from "react"

const MOBILE_BREAKPOINT = 768
const MobileContext = React.createContext<{
  isMobile: boolean;
  isOpen: boolean;
  toggleSidebar: () => void;
}>({
  isMobile: false,
  isOpen: true,
  toggleSidebar: () => {},
});

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const checkMobile = () => {
      // Type guard for userAgentData (not available in all browsers)
      const userAgent =
        navigator.userAgent ||
        (typeof (navigator as any).userAgentData !== "undefined"
          ? (navigator as any).userAgentData.brands?.map((b: any) => b.brand).join(" ")
          : "");
      const isMobileDevice = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(userAgent);
      setIsMobile(isMobileDevice || window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Ejecutar también al inicio
    checkMobile()
    
    // Registrar el event listener para window resize
    window.addEventListener("resize", checkMobile)
    
    // Limpiar al desmontar
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

// Add MobileProvider component
export function MobileProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = React.useState(!isMobile)
  
  React.useEffect(() => {
    setIsOpen(!isMobile)
  }, [isMobile])
  
  const toggleSidebar = React.useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])
  
  return (
    <MobileContext.Provider value={{ isMobile, isOpen, toggleSidebar }}>
      {children}
    </MobileContext.Provider>
  )
}

export function useMobile() {
  const context = React.useContext(MobileContext)
  if (context === undefined) {
    throw new Error("useMobile must be used within a MobileProvider")
  }
  return context
}
