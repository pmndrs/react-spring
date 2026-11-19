import { Controller } from './Controller'
import { declareUpdate } from './SpringValue'

const declared = () => declareUpdate({from:{width:100},to:[{width:200},{width:300}],loop:true})
async function secondStep(ctrl: Controller<{width:number}>) {
 await global.advanceUntil(()=>ctrl.springs.width.animation.to===300 && ctrl.get().width>220 && ctrl.get().width<280)
 expect(ctrl.springs.width.animation.to).toBe(300)
 expect(ctrl.get().width).toBeGreaterThan(220)
 expect(ctrl.get().width).toBeLessThan(280)
}
async function startAtSecondStep() {
 const ctrl=new Controller<{width:number}>()
 ctrl.start(declared())
 await secondStep(ctrl)
 return ctrl
}
function resets(frames:number[]) { return frames.filter((x,i)=>i>0&&x<frames[i-1]-50).length }

describe('2095 declared second-step reissue qualification',()=>{
 it('control: original declaration keeps looping across later frames',async()=>{
  const ctrl=await startAtSecondStep()
  try {
   global.getFrames(ctrl.springs.width)
   await global.advance(240)
   expect(resets(global.getFrames(ctrl.springs.width))).toBeGreaterThanOrEqual(2)
   expect(ctrl.idle).toBe(false)
  } finally { ctrl.stop(true) }
 })
 it('regression: a new equivalent declaration during second step keeps looping',async()=>{
  const ctrl=await startAtSecondStep()
  try {
   ctrl.start(declared())
   global.getFrames(ctrl.springs.width)
   await global.advance(240)
   expect(resets(global.getFrames(ctrl.springs.width))).toBeGreaterThanOrEqual(2)
   expect(ctrl.idle).toBe(false)
  } finally { ctrl.stop(true) }
 })
 it('cancellation after reissue stops current and future iterations',async()=>{
  const ctrl=await startAtSecondStep()
  try {
   const run=ctrl.start(declared())
   await global.advance(3)
   ctrl.stop(true)
   const stopped=ctrl.get().width
   await global.advance(240)
   expect(ctrl.get().width).toBe(stopped)
   expect(ctrl.idle).toBe(true)
   expect(await run).toMatchObject({cancelled:true,finished:false})
  } finally { ctrl.stop(true) }
 })
 it('pause holds reissued step and resume permits progress',async()=>{
  const ctrl=await startAtSecondStep()
  try {
   ctrl.start(declared())
   await global.advance(3)
   ctrl.pause()
   const paused=ctrl.get().width
   await global.advance(30)
   expect(ctrl.get().width).toBe(paused)
   expect(ctrl.springs.width.isPaused).toBe(true)
   ctrl.resume()
   await global.advance(15)
   expect(ctrl.get().width).not.toBe(paused)
   expect(ctrl.springs.width.isPaused).toBe(false)
  } finally { ctrl.stop(true) }
 })
 it('explicit loop false supersedes a declared loop without restarting',async()=>{
  const ctrl=await startAtSecondStep()
  try {
   ctrl.start(declareUpdate({to:{width:350},loop:false}))
   await global.advance(240)
   expect(ctrl.get().width).toBe(350)
   expect(ctrl.idle).toBe(true)
  } finally { ctrl.stop(true) }
 })
})
