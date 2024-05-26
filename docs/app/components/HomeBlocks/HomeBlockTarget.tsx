import { useState } from 'react'
import { animated, useTransition } from '@react-spring/web'

import { HomeBlockCopy } from './HomeBlockCopy'
import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicEffect'
import { section } from './shared.css'
import clsx from 'clsx'
import { pre } from '../Code/Pre.css'
import { homeBlockCode, list } from './HomeBlockTarget.css'

const webHtml = /* html */ `<div data-line="1" class="highlight-line" data-highlighted="true"><span class="token keyword module">import</span> <span class="token imports"><span class="token punctuation">{</span> animated<span class="token punctuation">,</span> useSpring <span class="token punctuation">}</span></span> <span class="token keyword module">from</span> <span class="token string">'@react-spring/web'</span>
</div><div data-line="2" class="highlight-line" data-highlighted="false">
</div><div data-line="3" class="highlight-line" data-highlighted="false"><span class="token keyword module">export</span> <span class="token keyword">const</span> <span class="token function-variable function"><span class="token maybe-class-name">MyComponent</span></span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token arrow operator">=&gt;</span> <span class="token punctuation">{</span>
</div><div data-line="4" class="highlight-line" data-highlighted="false">  <span class="token keyword">const</span> <span class="token punctuation">{</span> x <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">useSpring</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
</div><div data-line="5" class="highlight-line" data-highlighted="false">    <span class="token keyword module">from</span><span class="token operator">:</span> <span class="token punctuation">{</span>
</div><div data-line="6" class="highlight-line" data-highlighted="false">      x<span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
</div><div data-line="7" class="highlight-line" data-highlighted="false">    <span class="token punctuation">}</span><span class="token punctuation">,</span>
</div><div data-line="8" class="highlight-line" data-highlighted="false">    to<span class="token operator">:</span> <span class="token punctuation">{</span>
</div><div data-line="9" class="highlight-line" data-highlighted="false">      x<span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
</div><div data-line="10" class="highlight-line" data-highlighted="false">    <span class="token punctuation">}</span><span class="token punctuation">,</span>
</div><div data-line="11" class="highlight-line" data-highlighted="false">  <span class="token punctuation">}</span><span class="token punctuation">)</span>
</div><div data-line="12" class="highlight-line" data-highlighted="false">
</div><div data-line="13" class="highlight-line" data-highlighted="true">  <span class="token keyword control-flow">return</span> <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>animated.div</span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span> x <span class="token punctuation">}</span><span class="token punctuation">}</span></span> <span class="token punctuation">/&gt;</span></span>
</div><div data-line="14" class="highlight-line" data-highlighted="false"><span class="token punctuation">}</span>
</div>`

const nativeHtml = /* html */ `<div data-line="1" class="highlight-line" data-highlighted="true"><span class="token keyword module">import</span> <span class="token imports"><span class="token punctuation">{</span> animated<span class="token punctuation">,</span> useSpring <span class="token punctuation">}</span></span> <span class="token keyword module">from</span> <span class="token string">'@react-spring/native'</span>
</div><div data-line="2" class="highlight-line" data-highlighted="false">
</div><div data-line="3" class="highlight-line" data-highlighted="false"><span class="token keyword module">export</span> <span class="token keyword">const</span> <span class="token function-variable function"><span class="token maybe-class-name">MyComponent</span></span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token arrow operator">=&gt;</span> <span class="token punctuation">{</span>
</div><div data-line="4" class="highlight-line" data-highlighted="false">  <span class="token keyword">const</span> <span class="token punctuation">{</span> x <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">useSpring</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
</div><div data-line="5" class="highlight-line" data-highlighted="false">    <span class="token keyword module">from</span><span class="token operator">:</span> <span class="token punctuation">{</span>
</div><div data-line="6" class="highlight-line" data-highlighted="false">      x<span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
</div><div data-line="7" class="highlight-line" data-highlighted="false">    <span class="token punctuation">}</span><span class="token punctuation">,</span>
</div><div data-line="8" class="highlight-line" data-highlighted="false">    to<span class="token operator">:</span> <span class="token punctuation">{</span>
</div><div data-line="9" class="highlight-line" data-highlighted="false">      x<span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
</div><div data-line="10" class="highlight-line" data-highlighted="false">    <span class="token punctuation">}</span><span class="token punctuation">,</span>
</div><div data-line="11" class="highlight-line" data-highlighted="false">  <span class="token punctuation">}</span><span class="token punctuation">)</span>
</div><div data-line="12" class="highlight-line" data-highlighted="false">
</div><div data-line="13" class="highlight-line" data-highlighted="true">  <span class="token keyword control-flow">return</span> <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>animated.View</span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span> x <span class="token punctuation">}</span><span class="token punctuation">}</span></span> <span class="token punctuation">/&gt;</span></span>
</div><div data-line="14" class="highlight-line" data-highlighted="false"><span class="token punctuation">}</span>
</div>`

const threeHtml = /* html */ `<div data-line="1" class="highlight-line" data-highlighted="true"><span class="token keyword module">import</span> <span class="token imports"><span class="token punctuation">{</span> animated<span class="token punctuation">,</span> useSpring <span class="token punctuation">}</span></span> <span class="token keyword module">from</span> <span class="token string">'@react-spring/three'</span>
</div><div data-line="2" class="highlight-line" data-highlighted="false">
</div><div data-line="3" class="highlight-line" data-highlighted="false"><span class="token keyword module">export</span> <span class="token keyword">const</span> <span class="token function-variable function"><span class="token maybe-class-name">MyComponent</span></span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token arrow operator">=&gt;</span> <span class="token punctuation">{</span>
</div><div data-line="4" class="highlight-line" data-highlighted="false">  <span class="token keyword">const</span> <span class="token punctuation">{</span> x <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">useSpring</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
</div><div data-line="5" class="highlight-line" data-highlighted="false">    <span class="token keyword module">from</span><span class="token operator">:</span> <span class="token punctuation">{</span>
</div><div data-line="6" class="highlight-line" data-highlighted="false">      rotateX<span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
</div><div data-line="7" class="highlight-line" data-highlighted="false">    <span class="token punctuation">}</span><span class="token punctuation">,</span>
</div><div data-line="8" class="highlight-line" data-highlighted="false">    to<span class="token operator">:</span> <span class="token punctuation">{</span>
</div><div data-line="9" class="highlight-line" data-highlighted="false">      rotateX<span class="token operator">:</span> <span class="token known-class-name class-name">Math</span><span class="token punctuation">.</span><span class="token constant">PI</span><span class="token punctuation">,</span>
</div><div data-line="10" class="highlight-line" data-highlighted="false">    <span class="token punctuation">}</span><span class="token punctuation">,</span>
</div><div data-line="11" class="highlight-line" data-highlighted="false">  <span class="token punctuation">}</span><span class="token punctuation">)</span>
</div><div data-line="12" class="highlight-line" data-highlighted="false">
</div><div data-line="13" class="highlight-line" data-highlighted="true">  <span class="token keyword control-flow">return</span> <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>animated.mesh</span> <span class="token attr-name">rotate-x</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>x<span class="token punctuation">}</span></span> <span class="token punctuation">/&gt;</span></span>
</div><div data-line="14" class="highlight-line" data-highlighted="false"><span class="token punctuation">}</span>
</div>`

const konvaHtml = /* html */ `<div data-line="1" class="highlight-line" data-highlighted="true"><span class="token keyword module">import</span> <span class="token imports"><span class="token punctuation">{</span> animated<span class="token punctuation">,</span> useSpring <span class="token punctuation">}</span></span> <span class="token keyword module">from</span> <span class="token string">'@react-spring/konva'</span>
</div><div data-line="2" class="highlight-line" data-highlighted="false">
</div><div data-line="3" class="highlight-line" data-highlighted="false"><span class="token keyword module">export</span> <span class="token keyword">const</span> <span class="token function-variable function"><span class="token maybe-class-name">MyComponent</span></span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token arrow operator">=&gt;</span> <span class="token punctuation">{</span>
</div><div data-line="4" class="highlight-line" data-highlighted="false">  <span class="token keyword">const</span> <span class="token punctuation">{</span> x <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">useSpring</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
</div><div data-line="5" class="highlight-line" data-highlighted="false">    <span class="token keyword module">from</span><span class="token operator">:</span> <span class="token punctuation">{</span>
</div><div data-line="6" class="highlight-line" data-highlighted="false">      x<span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
</div><div data-line="7" class="highlight-line" data-highlighted="false">    <span class="token punctuation">}</span><span class="token punctuation">,</span>
</div><div data-line="8" class="highlight-line" data-highlighted="false">    to<span class="token operator">:</span> <span class="token punctuation">{</span>
</div><div data-line="9" class="highlight-line" data-highlighted="false">      x<span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
</div><div data-line="10" class="highlight-line" data-highlighted="false">    <span class="token punctuation">}</span><span class="token punctuation">,</span>
</div><div data-line="11" class="highlight-line" data-highlighted="false">  <span class="token punctuation">}</span><span class="token punctuation">)</span>
</div><div data-line="12" class="highlight-line" data-highlighted="false">
</div><div data-line="13" class="highlight-line" data-highlighted="true">  <span class="token keyword control-flow">return</span> <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>animated.Rect</span> <span class="token attr-name">x</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>x<span class="token punctuation">}</span></span> <span class="token punctuation">/&gt;</span></span>
</div><div data-line="14" class="highlight-line" data-highlighted="false"><span class="token punctuation">}</span>
</div>`

const zdogHtml = /* html */ `<div data-line="1" class="highlight-line" data-highlighted="true"><span class="token keyword module">import</span> <span class="token imports"><span class="token punctuation">{</span> animated<span class="token punctuation">,</span> useSpring <span class="token punctuation">}</span></span> <span class="token keyword module">from</span> <span class="token string">'@react-spring/zdog'</span>
</div><div data-line="2" class="highlight-line" data-highlighted="false">
</div><div data-line="3" class="highlight-line" data-highlighted="false"><span class="token keyword module">export</span> <span class="token keyword">const</span> <span class="token function-variable function"><span class="token maybe-class-name">MyComponent</span></span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token arrow operator">=&gt;</span> <span class="token punctuation">{</span>
</div><div data-line="4" class="highlight-line" data-highlighted="false">  <span class="token keyword">const</span> <span class="token punctuation">{</span> x <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">useSpring</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
</div><div data-line="5" class="highlight-line" data-highlighted="false">    <span class="token keyword module">from</span><span class="token operator">:</span> <span class="token punctuation">{</span>
</div><div data-line="6" class="highlight-line" data-highlighted="false">      x<span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
</div><div data-line="7" class="highlight-line" data-highlighted="false">    <span class="token punctuation">}</span><span class="token punctuation">,</span>
</div><div data-line="8" class="highlight-line" data-highlighted="false">    to<span class="token operator">:</span> <span class="token punctuation">{</span>
</div><div data-line="9" class="highlight-line" data-highlighted="false">      x<span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
</div><div data-line="10" class="highlight-line" data-highlighted="false">    <span class="token punctuation">}</span><span class="token punctuation">,</span>
</div><div data-line="11" class="highlight-line" data-highlighted="false">  <span class="token punctuation">}</span><span class="token punctuation">)</span>
</div><div data-line="12" class="highlight-line" data-highlighted="false">
</div><div data-line="13" class="highlight-line" data-highlighted="true">  <span class="token keyword control-flow">return</span> <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>animated.Ellipse</span> <span class="token attr-name">diameter</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>x<span class="token punctuation">}</span></span> <span class="token punctuation">/&gt;</span></span>
</div><div data-line="14" class="highlight-line" data-highlighted="false"><span class="token punctuation">}</span>
</div>`

const dataFixtures = [webHtml, nativeHtml, threeHtml, konvaHtml, zdogHtml]

export const HomeBlockTarget = () => {
  const [index, setIndex] = useState(0)

  const transition = useTransition(index, {
    from: {
      opacity: 0,
    },
    enter: {
      opacity: 1,
    },
    leave: {
      opacity: 0,
    },
    config: {
      duration: 800,
      precision: 0.0001,
    },
  })

  useIsomorphicLayoutEffect(() => {
    const interval = setInterval(() => {
      setIndex(s => (dataFixtures.length - 1 === s ? 0 : s + 1))
    }, 4000)

    return () => {
      clearInterval(interval)
    }
  }, [index])

  return (
    <section className={section}>
      <HomeBlockCopy
        subtitle="But wait, there’s more"
        title="It’s not just for web"
        cta={{
          label: 'Learn more about targets',
          href: '/docs/concepts/targets',
        }}
      >
        <p>Choose from our five targets:</p>
        <ul className={list}>
          <li>web</li>
          <li>native</li>
          <li>three</li>
          <li>konva</li>
          <li>zdog</li>
        </ul>
        <p>
          Missing a target you want? Request we add it or create it yourself
          with our advanced API usage.
        </p>
      </HomeBlockCopy>
      <pre className={clsx(pre, homeBlockCode)}>
        <code
          className="language-jsx"
          dangerouslySetInnerHTML={{ __html: dataFixtures[0] }}
          style={{
            visibility: 'hidden',
          }}
        />
        {transition((style, i) => (
          <animated.code
            className="language-jsx"
            dangerouslySetInnerHTML={{ __html: dataFixtures[i] }}
            style={{ ...style, position: 'absolute', top: 30, left: 30 }}
          />
        ))}
      </pre>
    </section>
  )
}
