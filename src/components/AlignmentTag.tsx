import type { Alignment } from '../types'
import { ALIGNMENT_LABELS } from '../utils'
import './AlignmentTag.css'

export default function AlignmentTag({ alignment }: { alignment: Alignment }) {
  return <span className={`tag tag-${alignment}`}>{ALIGNMENT_LABELS[alignment]}</span>
}
