import { Controller } from './Controller'
import { declareUpdate } from './SpringValue'

describe('2095 clean source stop semantics observations',()=>{
 for(const stage of ['original-second','reissue-early','reissue-second','original-none','reissue-none'] as const){
  for(const mode of (stage.endsWith('none')?['none']:['key-stop','key-cancel','global-stop']) as ('none'|'key-stop'|'key-cancel'|'global-stop')[]){
   it(`${stage} ${mode}`,async()=>{
    const ctrl=new Controller<{width:number}>()
    let loops=0
    const events:any[]=[]
    const result=(r:any)=>({finished:r.finished,cancelled:r.cancelled,noop:r.noop,value:typeof r.value?.get==='function'?r.value.get():r.value})
    const props=()=>declareUpdate({from:{width:100},to:[{width:200},{width:300}],loop:()=>{loops++;return loops<2},onRest:(r:any)=>events.push({event:'rest',...result(r)}),onResolve:(r:any)=>events.push({event:'resolve',...result(r)})})
    const promises:any={}
    const watch=(name:string,p:Promise<any>)=>{p.then(r=>promises[name]=result(r))}
    const phase=async()=>{
     await global.advanceUntil(()=>ctrl.springs.width.goal===300&&ctrl.get().width>220&&ctrl.get().width<280)
     expect(ctrl.springs.width.goal).toBe(300)
     expect(ctrl.get().width).toBeGreaterThan(220)
     expect(ctrl.get().width).toBeLessThan(280)
    }
    try{
     watch('initial',ctrl.start(props()))
     await phase()
     if(stage.startsWith('reissue')){
      watch('replacement',ctrl.start(props()))
      await global.advance(3)
      if(stage==='reissue-second')await phase()
     }
     const before={width:ctrl.get().width,goal:ctrl.springs.width.goal,idle:ctrl.idle,loops,events:events.length}
     global.getFrames(ctrl.springs.width)
     if(mode==='key-stop')ctrl.stop(false,'width')
     if(mode==='key-cancel')ctrl.stop(true,'width')
     if(mode==='global-stop')ctrl.stop(false)
     await global.advance(240)
     const frames=global.getFrames(ctrl.springs.width) as number[]
     console.warn('STOP_OBSERVATION '+JSON.stringify({stage,mode,before,after:{width:ctrl.get().width,idle:ctrl.idle,loops,resets:frames.filter((x,i)=>i&&x<frames[i-1]-50).length,frames:frames.length},promises,events}))
    }finally{ctrl.stop(true)}
   })
  }
 }
})
