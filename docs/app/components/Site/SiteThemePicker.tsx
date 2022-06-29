export const SiteThemePicker = () => (
  <script
    dangerouslySetInnerHTML={{
      __html: /* js */ `
        !function(){
            try {
                var d=document.documentElement.classList;
                d.remove('light','dark');
                var e=localStorage.getItem('theme');
                if("system"===e||(!e&&true)){
                    var t="(prefers-color-scheme: dark)";
                    var m=window.matchMedia(t);

                    m.media!==t||m.matches ? d.add('dark') :d.add('light')
                }
                else if(e) {
                    var x={"light":"light","dark":"dark"};
                    d.add(x[e])
                }
            }
            catch(e){}
          }()
        `,
    }}
  />
)
