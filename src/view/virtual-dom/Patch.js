import DomIndex from './DomIndex'


// hack here !!!
// 从某些页面返回的时候, 上一个页面会重复渲染一坨一样的元素
// 原因是 Diff 出多一坨 VNode, 很难排查, 所以加了个黑名单, 防止元素重复...
const blackList = ["info-content", "analytics"]

const rejectDirtyPatch = (vpatch) => {
  if(vpatch && vpatch.patch && vpatch.patch.props && vpatch.patch.props.class){
    let className = vpatch.patch.props.class
    let isDirty = blackList.some(b => className.includes(b))
    return isDirty
  }
}

class Patch {
  constructor (oldTree, patches) {
    this.oldTree = oldTree
    this.patches = patches
    this.patchIndexes = Object.keys(this.patches).map(function (idx) {
      return Number(idx)
    })
  }

  apply (rootNode) {
    let that = this
    if (this.patchIndexes.length === 0) return rootNode

    let doms = DomIndex.getDomIndex(rootNode, this.oldTree, this.patchIndexes)

    this.patchIndexes.forEach(function (patchIdx) {
      let dom = doms[patchIdx]
      if (dom) {
        let patches = that.patches[patchIdx]
        patches.forEach(function (vpatch) {
          if(rejectDirtyPatch(vpatch)){
            return
          }

          vpatch.apply(dom)
        })
      }
    })
    return rootNode
  }
}
export default Patch
