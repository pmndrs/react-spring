import { json, LoaderFunction, MetaFunction, redirect } from '@vercel/remix'
import { GradientButton } from '~/components/Buttons/GradientButton'

import { Header } from '~/components/Header/Header'
import { Heading } from '~/components/Text/Heading'
import { errorHeading, main, pre } from './../styles/routes/$.css'

export const meta: MetaFunction = () => {
  return [
    {
      title: '404 | react-spring',
    },
    {
      name: 'description',
      contnet: `With naturally fluid animations you will elevate your UI & interactions. Bringing your apps to life has never been simpler.`,
    },
  ]
}

const CAR = `                                                    7%;;WW/                                                                                                                                             
                                                   (W HQXXXXXXX/                                                                                                                                        
                                                 /;NNXXXXXXXXXXX                                                                                                                                        
                                                 (7 WXXXXXXXXXXXA                                                                                                                                       
                                               %7;% QXXXXXXXXXXXXQ                                                                                                                                      
                                              X;<Y  XXXXXXXXXXXXXXB                                                                                                                                     
                                            A(<(%   XXXXXXXXXXXXXXXQ                                                                                                                                    
                                        /QY(;;A     XXXXXXXXXXXXXXXX(                                                                                                                                   
                                      X;&(&;YV      XXXXXXXXXXXXXXXXX                                                                                                                                   
                                    X;;;;(;(        XXXXXXXXXXXXXXXXXX                                                                                                                                  
                                  77bW;W<<X&        XXXXXXXXXXXXXXXXXXX7                                                                                                                                
                                    /Y 7W7 (       ;XXXXXXXXXXXXXXAWQWWQ                                                                                                                                
                                   /               cXXXXXXXXBQyvvvv&vvvvX7                                                                                                                              
                                                   %XXXW&vcWvvXvvvyvvvcYAA                                                                                                                              
                                                   Q@vvcvvvvvvyvvvvcv     X /                                                                                                                           
                                                     @vvvv&vvvvvQvX      @/Y                                                                                                                            
                                                    /vvXXvvvvvvvvvc%    QvWvcX                                                                                                                          
                                                     HvvvBvvvvvvvvvvvv%&vvvvvvc                                                                                                                         
                                                     BWvvyvvvvvvvvcQ((((((XHXy                                                                                                                          
                                                    (vvyvvvvvvv%QW((((((((((W                                                                                                                           
                                                   (vvvyWQvvvX(((((((((((((((((v(                                                                                                                       
                                                   yvXvvvvvvQ(vX%(((((((W((7(((7V                                                                                                                       
                                                   @c2vvQvvvvB((((((((((&                                                                                                                               
                                                  /@@@&vXvvvvQ(((((((A                                                                                                                                  
                                                  (@@@@@@@yvvv@(((%&                                                                                                                                    
                                                 /@@@@@@@@@@@@W/A@H@                                                                                                                                    
                                                7@@@@@@@@@@@@@@@@XXX@                                                                                                                                   
                                               @@@@@@@@@@@@@@@@@@XXWB                                                                                                                                   
                                              @@@@@@@@@@@@@@@@@@@XX@                                                                                                                                    
                                             @@@@@@@@@@@@@@@@@@@@@@@                                                                                                                                    
                                           <@@@@@@@@@@@@@@@@@@@@@@@@@@                c/@                                                                                                               
                                          ;@@@@@@@@@@@@@@@@@@@@@@@@@@@@@B              B/@                                                                                                              
                                          @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@N         //@@                                                                                                             
                                         @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@NN    @<c@                                                                                                            
                                         @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%   <Q N                                                                                                           
                                         @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@W;@/W Q/                                                                                                         
                                         @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@/<;X;%   7                                                                                                        
                                         @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@Nvv&Q(//y/@   B                                                                                                       
                                 WB7/////N@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@vvvy%@@@@7(@@@@@W7V(;                                                                                                 
                        @(<(A@@;/////<N@B%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@yvvWvv;<@(&/@<@(///////////////////////////////7&@W/                                                                   
                       &          &@@%/////@@@@@@@@NN@@@@@@@@@@@@@@@@@@@@@@@@@@@@vvvv@NBc//@&(@&//<<<(ccyQQ@@@N@NA&c7<////////<7cANHBcy7                                                                
                      %  /(%XBN@@QV((////////////////////////////////////////////////////////////////////////////////(<vv%yv&&&yv((//////BN                                                             
        <vQN@@@@A7/////////////////////////////////@/////////////////////////////////////////(7/////////////////////////////////////////////N                                                           
 (W//N/////////////////////////////////////////y/       //(v%A@@@@@@@@@@@@@@@@@@@NAAv(//        %////////////////////////////////////////////@                                                          
 &//&//////////////////////////////////////////Q y                                            ( @/////////////////////////////////////////////                                                          
A///@//////////////////////////////////////////                                                 c/////////////////////////////////////////////bQ                                                        
N///A/////////////////////////////////////////y                                                 //////////////////////////////////////////////@7                                                        
(///7/////////////////////////////////////////X                                                 /////////////////((yV&v(((////////////////////B@                                                        
///<//////////////////////////////////////////&                                                 ////////&@@@@@@@@@@@@@@@@@@@@@@ NH@@@@@@@@@Av (                                                         
///;//////////////////////////////////////////7                                                 Q///////@@@@@@@@@@@@@@@@@@@@@@@@7B  /     7 /X@                                                         
c///(///////////////////////////////////////////                                                @//////@@@@@@@@@X;(;((;(;B@@@@@@@@/////////////                                                         
@///A//////////////////////////////////////////N                                                7//////@@@@@@@W(%A//////W;(@@@@@@@@////////////                                                         
;///@//////////////////////<<//////////////////vV                                              b//////A@@@@@@b(N//////////7(W@@@@@@////////////                                                         
 @///c//////////////////@@@@N;N///////////@;c@N////@/%N@@@NW&7(////(<////77v&bWN@@@@NQy%<////@////////@@@@@@@;N////////////;(@@@@@@@//////////N                                                         
  /@BN/////////////////@@@@@((@////////////((@@@%//(/////////////////////////////////////////V////////cB@@@@N;B////////////y;N@@@@@    /%c(                                                             
         7N@@@@@N&&yyy@@@@@@v;@///////////<(;@@@@@@N@V;/////////////////////////////////////(////////cB@@@@@@(@////////////(;@@@@@@                                                                     
                      @@@@@@N(v(//////////@(N@@@@@/              ///v(vv(%XXA@@XX7vv//                 @@@@@@;(@//////////%(;@@@@@@                                                                     
                       @@@@@@V;(@////////B;X@@@@@@                                                     v@@@@@@;(7W//////@(;(@@@@@@                                                                      
                        @@N@@@@(;(X@@@@v(;@@@@@@@                                                       y@N@@@@@;(;((;(;(;N@@@@@@                                                                       
                         N@@@@@@@W(;;(;W@@@@B@@(                                                          @@@@@@@@@WV%X@@@@@@@@W                                                                        
                           @@@@@@@@@@@@@@@@@@@                                                              @@N@@@@@@@@@@@@@@@                                                                          
                             V@@@@@@@@@@@@@(                                                                  X@@@@@@@@@N@@(                                                                            
                                 /QQQQc                                                                                                                                                                 
                                                                                                                                                                                                        
`

export const loader: LoaderFunction = ({ request }) => {
  const url = new URL(request.url)

  switch (url.pathname) {
    case '/common/props':
    case '/components/spring-context':
      return redirect('/docs')
    case '/basics':
      return redirect('/docs/getting-started')
    case '/common/configs':
      return redirect('/docs/advanced/config')
    case '/common/imperatives-and-refs':
      return redirect('/docs/advanced/spring-ref')
    case '/common/interpolation':
      return redirect('/docs/advanced/interpolation')
    case '/classes/controller':
      return redirect('/docs/advanced/controller')
    case '/classes/spring-value':
      return redirect('/docs/advanced/spring-value')
    case '/guides/accessibility':
      return redirect('/docs/utilities/use-reduced-motion')
    case '/guides/r3f':
      return redirect('/docs/guides/react-three-fiber')
    case '/guides/testing':
      return redirect('/docs/guides/testing')
    case '/components/parallax':
      return redirect('/docs/components/parallax')
  }

  const [_, type, comp] = url.pathname.split('/')

  if (type === 'hooks' || type === 'components') {
    return redirect(
      `/docs/components/${type === 'components' ? `use-${comp}` : comp}`
    )
  }

  return json({})
}

export default function Index() {
  return (
    <>
      <Header addMarginToMain={false} position="fixed" />
      <main className={main}>
        <pre className={pre}>{CAR}</pre>
        <Heading tag="h2" fontStyle="XL" className={errorHeading}>
          404, not found
        </Heading>
        <GradientButton href="/">Go home</GradientButton>
      </main>
    </>
  )
}
