
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

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
  return isMobile === undefined ? false : isMobile
}
