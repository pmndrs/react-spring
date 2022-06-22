import { MetaFunction } from 'remix'
import { GradientButton } from '~/components/Buttons/GradientButton'

import { Header } from '~/components/Header/Header'
import { Heading } from '~/components/Text/Heading'

import { styled } from '~/styles/stitches.config'

export const meta: MetaFunction = () => {
  return {
    title: '404 | react-spring',
    description: `With naturally fluid animations you will elevate your UI & interactions. Bringing your apps to life has never been simpler.`,
  }
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

export default function Index() {
  return (
    <>
      <Header addMarginToMain={false} position="fixed" alwaysAnimateHeader />
      <Main>
        <Pre>{CAR}</Pre>
        <ErrorHeading tag="h2" fontStyle="$XL">
          404, not found
        </ErrorHeading>
        <GradientButton href="/">Go home</GradientButton>
      </Main>
    </>
  )
}

const Main = styled('main', {
  width: '100%',
  height: '100%',
  overflowX: 'hidden',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  mt: '$40',

  '@tabletUp': {
    mt: '$100',
  },
})

const Pre = styled('pre', {
  fontSize: 'clamp(2px, 1vw, 8px)',
  transform: 'translateX(clamp(1px, 17vw, 130px))',
})

const ErrorHeading = styled(Heading, {
  mt: '$10',
  mb: '$20',

  '@tabletUp': {
    mt: '$20',
    mb: '$40',
  },
})
