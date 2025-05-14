
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
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Ejecutar también al inicio
    onChange()
    
    // Registrar el event listener
    mql.addEventListener("change", onChange)
    
    // Limpiar al desmontar
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Si no se ha determinado aún, asumimos que no es móvil
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
