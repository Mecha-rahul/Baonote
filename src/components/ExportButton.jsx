import { Download } from 'lucide-react'
import IconBtn from './IconBtn.jsx'

/**
 * Quiet export icon button (no big accent square) floating bottom-right,
 * in the same surface style as the other controls.
 */
export default function ExportButton() {
  return <IconBtn label="Export" icon={Download} variant="solid" />
}
