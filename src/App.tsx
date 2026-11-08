import { FlatScreen } from './renderers/FlatScreen'
import { Presenter } from './renderers/Presenter'
import { SlideIndex } from './renderers/SlideIndex'
import { Stage } from './renderers/Stage'
import { useKeys } from './engine/useKeys'
import { FLAT, INDEX, PRESENTER } from './engine/params'

export default function App() {
  useKeys()
  if (INDEX) return <SlideIndex />
  if (PRESENTER) return <Presenter />
  return FLAT ? <FlatScreen /> : <Stage />
}
