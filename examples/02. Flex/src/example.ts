import { DisplayFlag, _u } from '@tinytales/_underline'

export default function runExample() {
  flexCol()
}

const flexCol = () => {
  _u.begin('flex-col')
  _u.display(DisplayFlag.FlexCol)
  _u.dimension(250, 750)

  _u.begin('>> red')
  _u.display(DisplayFlag.FlexFixed)
  _u.fill('#FF0000')
  _u.dimension('100%', 150)

  _u.begin('>> green')
  _u.display(DisplayFlag.FlexDynamic)
  _u.fill('#00FF44')

  _u.begin('>> blue')
  _u.display(DisplayFlag.FlexFixed)
  _u.fill('#0033FF')
}

// In this example we use the >> operator to assign the block
// to the parent. It is a short form for flex-row > block
//
// For more information see: TODO URL
const flexRow = () => {
  _u.begin('absolute-parent = ap')
  _u.display(DisplayFlag.Absolute)
  _u.position(300, 0)

  _u.begin('ap > flex-row')
  _u.display(DisplayFlag.FlexRow)
  _u.dimension('100%', 250)

  _u.begin('>> red2')
  _u.display(DisplayFlag.FlexFixed)
  _u.fill('#FF0000')
  _u.dimension(150, '100%')

  _u.begin('>> green2')
  _u.display(DisplayFlag.FlexDynamic)
  _u.fill('#00FF44')

  _u.begin('>> blue2')
  _u.display(DisplayFlag.FlexFixed)
  _u.fill('#0033FF')
  _u.dimension(150, '100%')
}
