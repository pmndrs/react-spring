import { animated, useSprings } from '@react-spring/web'

import { styled } from '~/styles/stitches.config'

import { HomeBlockCopy } from './HomeBlockCopy'
import { Section } from './HomeBlockSection'
import { Pre } from '../Code/Pre'
import { useState } from 'react'

const listItems = [
  'Animate any value – strings, numbers, css variables...',
  'Shorthand transformation styles',
  'Interpolate values inline',
  'Easily react to animation events',
  'Usable with any component library',
]

const dataFixtures = [
  `<code class="language-jsx" lines="7-11"><div data-line="1" class="highlight-line" data-highlighted="false"><span class="token keyword module">import</span> <span class="token imports"><span class="token operator">*</span> <span class="token keyword module">as</span> <span class="token maybe-class-name">Dialog</span></span> <span class="token keyword module">from</span> <span class="token string">'@radix-ui/react-dialog'</span>
</div><div data-line="2" class="highlight-line" data-highlighted="false"><span class="token keyword module">import</span> <span class="token imports"><span class="token punctuation">{</span> styled <span class="token punctuation">}</span></span> <span class="token keyword module">from</span> <span class="token string">'@stitches/react'</span>
</div><div data-line="3" class="highlight-line" data-highlighted="false"><span class="token keyword module">import</span> <span class="token imports"><span class="token punctuation">{</span> animated<span class="token punctuation">,</span> useSpring <span class="token punctuation">}</span></span> <span class="token keyword module">from</span> <span class="token string">'@react-spring/web'</span>
</div><div data-line="4" class="highlight-line" data-highlighted="false">
</div><div data-line="5" class="highlight-line" data-highlighted="false"><span class="token keyword module">export</span> <span class="token keyword">const</span> <span class="token function-variable function"><span class="token maybe-class-name">AnimatedDialog</span></span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">{</span> isOpen<span class="token punctuation">,</span> onOpenCallback <span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token arrow operator">=&gt;</span> <span class="token punctuation">{</span>
</div><div data-line="6" class="highlight-line" data-highlighted="false">  <span class="token keyword">const</span> <span class="token punctuation">{</span> x<span class="token punctuation">,</span> backgroundColor<span class="token punctuation">,</span> o <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">useSpring</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
</div><div data-line="7" class="highlight-line" data-highlighted="true">    x<span class="token operator">:</span> isOpen <span class="token operator">?</span> <span class="token string">'0%'</span> <span class="token operator">:</span> <span class="token string">'-100%'</span><span class="token punctuation">,</span>
</div><div data-line="8" class="highlight-line" data-highlighted="true">    backgroundColor<span class="token operator">:</span> isOpen
</div><div data-line="9" class="highlight-line" data-highlighted="true">      <span class="token operator">?</span> <span class="token string">'var(--color-whiteblur)'</span>
</div><div data-line="10" class="highlight-line" data-highlighted="true">      <span class="token operator">:</span> <span class="token string">'var(--colors-white00)'</span><span class="token punctuation">,</span>
</div><div data-line="11" class="highlight-line" data-highlighted="true">    o<span class="token operator">:</span> isOpen <span class="token operator">?</span> <span class="token number">1</span> <span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
</div><div data-line="12" class="highlight-line" data-highlighted="false">    <span class="token function-variable function">onRest</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token arrow operator">=&gt;</span> <span class="token punctuation">{</span>
</div><div data-line="13" class="highlight-line" data-highlighted="false">      <span class="token keyword control-flow">if</span> <span class="token punctuation">(</span>isOpen <span class="token operator">&amp;&amp;</span> onOpenCallback<span class="token punctuation">)</span> <span class="token punctuation">{</span>
</div><div data-line="14" class="highlight-line" data-highlighted="false">        <span class="token function">onOpenCallback</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
</div><div data-line="15" class="highlight-line" data-highlighted="false">      <span class="token punctuation">}</span>
</div><div data-line="16" class="highlight-line" data-highlighted="false">    <span class="token punctuation">}</span><span class="token punctuation">,</span>
</div><div data-line="17" class="highlight-line" data-highlighted="false">  <span class="token punctuation">}</span><span class="token punctuation">)</span>
</div><div data-line="18" class="highlight-line" data-highlighted="false">
</div><div data-line="19" class="highlight-line" data-highlighted="false">  <span class="token keyword control-flow">return</span> <span class="token punctuation">(</span>
</div><div data-line="20" class="highlight-line" data-highlighted="false">    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Dialog.Root</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text"></span>
</div><div data-line="21" class="highlight-line" data-highlighted="false"><span class="token plain-text">      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Overlay</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span> backgroundColor <span class="token punctuation">}</span><span class="token punctuation">}</span></span> <span class="token punctuation">/&gt;</span></span><span class="token plain-text"></span>
</div><div data-line="22" class="highlight-line" data-highlighted="false"><span class="token plain-text">      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Modal</span></span>
        <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span>
          x<span class="token punctuation">,</span>
          backgroundColor<span class="token operator">:</span> o<span class="token punctuation">.</span><span class="token method function property-access">to</span><span class="token punctuation">(</span><span class="token parameter">o</span> <span class="token arrow operator">=&gt;</span> <span class="token string">'rgba(255,255,255,'</span> <span class="token operator">+</span> o <span class="token operator">+</span> <span class="token string">')'</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
        <span class="token punctuation">}</span><span class="token punctuation">}</span></span>
      <span class="token punctuation">/&gt;</span></span><span class="token plain-text"></span>
</div><div data-line="23" class="highlight-line" data-highlighted="false"><span class="token plain-text">    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">Dialog.Root</span></span><span class="token punctuation">&gt;</span></span>
</div><div data-line="24" class="highlight-line" data-highlighted="false">  <span class="token punctuation">)</span>
</div><div data-line="25" class="highlight-line" data-highlighted="false"><span class="token punctuation">}</span>
</div></code>`,
  `<code class="language-jsx" lines="7"><div data-line="1" class="highlight-line" data-highlighted="false"><span class="token keyword module">import</span> <span class="token imports"><span class="token operator">*</span> <span class="token keyword module">as</span> <span class="token maybe-class-name">Dialog</span></span> <span class="token keyword module">from</span> <span class="token string">'@radix-ui/react-dialog'</span>
</div><div data-line="2" class="highlight-line" data-highlighted="false"><span class="token keyword module">import</span> <span class="token imports"><span class="token punctuation">{</span> styled <span class="token punctuation">}</span></span> <span class="token keyword module">from</span> <span class="token string">'@stitches/react'</span>
</div><div data-line="3" class="highlight-line" data-highlighted="false"><span class="token keyword module">import</span> <span class="token imports"><span class="token punctuation">{</span> animated<span class="token punctuation">,</span> useSpring <span class="token punctuation">}</span></span> <span class="token keyword module">from</span> <span class="token string">'@react-spring/web'</span>
</div><div data-line="4" class="highlight-line" data-highlighted="false">
</div><div data-line="5" class="highlight-line" data-highlighted="false"><span class="token keyword module">export</span> <span class="token keyword">const</span> <span class="token function-variable function"><span class="token maybe-class-name">AnimatedDialog</span></span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">{</span> isOpen<span class="token punctuation">,</span> onOpenCallback <span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token arrow operator">=&gt;</span> <span class="token punctuation">{</span>
</div><div data-line="6" class="highlight-line" data-highlighted="false">  <span class="token keyword">const</span> <span class="token punctuation">{</span> x<span class="token punctuation">,</span> backgroundColor<span class="token punctuation">,</span> o <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">useSpring</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
</div><div data-line="7" class="highlight-line" data-highlighted="true">    x<span class="token operator">:</span> isOpen <span class="token operator">?</span> <span class="token string">'0%'</span> <span class="token operator">:</span> <span class="token string">'-100%'</span><span class="token punctuation">,</span>
</div><div data-line="8" class="highlight-line" data-highlighted="false">    backgroundColor<span class="token operator">:</span> isOpen
</div><div data-line="9" class="highlight-line" data-highlighted="false">      <span class="token operator">?</span> <span class="token string">'var(--color-whiteblur)'</span>
</div><div data-line="10" class="highlight-line" data-highlighted="false">      <span class="token operator">:</span> <span class="token string">'var(--colors-white00)'</span><span class="token punctuation">,</span>
</div><div data-line="11" class="highlight-line" data-highlighted="false">    o<span class="token operator">:</span> isOpen <span class="token operator">?</span> <span class="token number">1</span> <span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
</div><div data-line="12" class="highlight-line" data-highlighted="false">    <span class="token function-variable function">onRest</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token arrow operator">=&gt;</span> <span class="token punctuation">{</span>
</div><div data-line="13" class="highlight-line" data-highlighted="false">      <span class="token keyword control-flow">if</span> <span class="token punctuation">(</span>isOpen <span class="token operator">&amp;&amp;</span> onOpenCallback<span class="token punctuation">)</span> <span class="token punctuation">{</span>
</div><div data-line="14" class="highlight-line" data-highlighted="false">        <span class="token function">onOpenCallback</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
</div><div data-line="15" class="highlight-line" data-highlighted="false">      <span class="token punctuation">}</span>
</div><div data-line="16" class="highlight-line" data-highlighted="false">    <span class="token punctuation">}</span><span class="token punctuation">,</span>
</div><div data-line="17" class="highlight-line" data-highlighted="false">  <span class="token punctuation">}</span><span class="token punctuation">)</span>
</div><div data-line="18" class="highlight-line" data-highlighted="false">
</div><div data-line="19" class="highlight-line" data-highlighted="false">  <span class="token keyword control-flow">return</span> <span class="token punctuation">(</span>
</div><div data-line="20" class="highlight-line" data-highlighted="false">    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Dialog.Root</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text"></span>
</div><div data-line="21" class="highlight-line" data-highlighted="false"><span class="token plain-text">      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Overlay</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span> backgroundColor <span class="token punctuation">}</span><span class="token punctuation">}</span></span> <span class="token punctuation">/&gt;</span></span><span class="token plain-text"></span>
</div><div data-line="22" class="highlight-line" data-highlighted="false"><span class="token plain-text">      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Modal</span></span>
        <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span>
          x<span class="token punctuation">,</span>
          backgroundColor<span class="token operator">:</span> o<span class="token punctuation">.</span><span class="token method function property-access">to</span><span class="token punctuation">(</span><span class="token parameter">o</span> <span class="token arrow operator">=&gt;</span> <span class="token string">'rgba(255,255,255,'</span> <span class="token operator">+</span> o <span class="token operator">+</span> <span class="token string">')'</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
        <span class="token punctuation">}</span><span class="token punctuation">}</span></span>
      <span class="token punctuation">/&gt;</span></span><span class="token plain-text"></span>
</div><div data-line="23" class="highlight-line" data-highlighted="false"><span class="token plain-text">    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">Dialog.Root</span></span><span class="token punctuation">&gt;</span></span>
</div><div data-line="24" class="highlight-line" data-highlighted="false">  <span class="token punctuation">)</span>
</div><div data-line="25" class="highlight-line" data-highlighted="false"><span class="token punctuation">}</span>
</div></code>`,
  `<code class="language-jsx" lines="22"><div data-line="1" class="highlight-line" data-highlighted="false"><span class="token keyword module">import</span> <span class="token imports"><span class="token operator">*</span> <span class="token keyword module">as</span> <span class="token maybe-class-name">Dialog</span></span> <span class="token keyword module">from</span> <span class="token string">'@radix-ui/react-dialog'</span>
</div><div data-line="2" class="highlight-line" data-highlighted="false"><span class="token keyword module">import</span> <span class="token imports"><span class="token punctuation">{</span> styled <span class="token punctuation">}</span></span> <span class="token keyword module">from</span> <span class="token string">'@stitches/react'</span>
</div><div data-line="3" class="highlight-line" data-highlighted="false"><span class="token keyword module">import</span> <span class="token imports"><span class="token punctuation">{</span> animated<span class="token punctuation">,</span> useSpring <span class="token punctuation">}</span></span> <span class="token keyword module">from</span> <span class="token string">'@react-spring/web'</span>
</div><div data-line="4" class="highlight-line" data-highlighted="false">
</div><div data-line="5" class="highlight-line" data-highlighted="false"><span class="token keyword module">export</span> <span class="token keyword">const</span> <span class="token function-variable function"><span class="token maybe-class-name">AnimatedDialog</span></span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">{</span> isOpen<span class="token punctuation">,</span> onOpenCallback <span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token arrow operator">=&gt;</span> <span class="token punctuation">{</span>
</div><div data-line="6" class="highlight-line" data-highlighted="false">  <span class="token keyword">const</span> <span class="token punctuation">{</span> x<span class="token punctuation">,</span> backgroundColor<span class="token punctuation">,</span> o <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">useSpring</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
</div><div data-line="7" class="highlight-line" data-highlighted="false">    x<span class="token operator">:</span> isOpen <span class="token operator">?</span> <span class="token string">'0%'</span> <span class="token operator">:</span> <span class="token string">'-100%'</span><span class="token punctuation">,</span>
</div><div data-line="8" class="highlight-line" data-highlighted="false">    backgroundColor<span class="token operator">:</span> isOpen
</div><div data-line="9" class="highlight-line" data-highlighted="false">      <span class="token operator">?</span> <span class="token string">'var(--color-whiteblur)'</span>
</div><div data-line="10" class="highlight-line" data-highlighted="false">      <span class="token operator">:</span> <span class="token string">'var(--colors-white00)'</span><span class="token punctuation">,</span>
</div><div data-line="11" class="highlight-line" data-highlighted="false">    o<span class="token operator">:</span> isOpen <span class="token operator">?</span> <span class="token number">1</span> <span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
</div><div data-line="12" class="highlight-line" data-highlighted="false">    <span class="token function-variable function">onRest</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token arrow operator">=&gt;</span> <span class="token punctuation">{</span>
</div><div data-line="13" class="highlight-line" data-highlighted="false">      <span class="token keyword control-flow">if</span> <span class="token punctuation">(</span>isOpen <span class="token operator">&amp;&amp;</span> onOpenCallback<span class="token punctuation">)</span> <span class="token punctuation">{</span>
</div><div data-line="14" class="highlight-line" data-highlighted="false">        <span class="token function">onOpenCallback</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
</div><div data-line="15" class="highlight-line" data-highlighted="false">      <span class="token punctuation">}</span>
</div><div data-line="16" class="highlight-line" data-highlighted="false">    <span class="token punctuation">}</span><span class="token punctuation">,</span>
</div><div data-line="17" class="highlight-line" data-highlighted="false">  <span class="token punctuation">}</span><span class="token punctuation">)</span>
</div><div data-line="18" class="highlight-line" data-highlighted="false">
</div><div data-line="19" class="highlight-line" data-highlighted="false">  <span class="token keyword control-flow">return</span> <span class="token punctuation">(</span>
</div><div data-line="20" class="highlight-line" data-highlighted="false">    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Dialog.Root</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text"></span>
</div><div data-line="21" class="highlight-line" data-highlighted="false"><span class="token plain-text">      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Overlay</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span> backgroundColor <span class="token punctuation">}</span><span class="token punctuation">}</span></span> <span class="token punctuation">/&gt;</span></span><span class="token plain-text"></span>
</div><div data-line="22" class="highlight-line" data-highlighted="true"><span class="token plain-text">      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Modal</span></span>
        <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span>
          x<span class="token punctuation">,</span>
          backgroundColor<span class="token operator">:</span> o<span class="token punctuation">.</span><span class="token method function property-access">to</span><span class="token punctuation">(</span><span class="token parameter">o</span> <span class="token arrow operator">=&gt;</span> <span class="token string">'rgba(255,255,255,'</span> <span class="token operator">+</span> o <span class="token operator">+</span> <span class="token string">')'</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
        <span class="token punctuation">}</span><span class="token punctuation">}</span></span>
      <span class="token punctuation">/&gt;</span></span><span class="token plain-text"></span>
</div><div data-line="23" class="highlight-line" data-highlighted="false"><span class="token plain-text">    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">Dialog.Root</span></span><span class="token punctuation">&gt;</span></span>
</div><div data-line="24" class="highlight-line" data-highlighted="false">  <span class="token punctuation">)</span>
</div><div data-line="25" class="highlight-line" data-highlighted="false"><span class="token punctuation">}</span>
</div></code>`,
  `<code class="language-jsx" lines="12-16"><div data-line="1" class="highlight-line" data-highlighted="false"><span class="token keyword module">import</span> <span class="token imports"><span class="token operator">*</span> <span class="token keyword module">as</span> <span class="token maybe-class-name">Dialog</span></span> <span class="token keyword module">from</span> <span class="token string">'@radix-ui/react-dialog'</span>
</div><div data-line="2" class="highlight-line" data-highlighted="false"><span class="token keyword module">import</span> <span class="token imports"><span class="token punctuation">{</span> styled <span class="token punctuation">}</span></span> <span class="token keyword module">from</span> <span class="token string">'@stitches/react'</span>
</div><div data-line="3" class="highlight-line" data-highlighted="false"><span class="token keyword module">import</span> <span class="token imports"><span class="token punctuation">{</span> animated<span class="token punctuation">,</span> useSpring <span class="token punctuation">}</span></span> <span class="token keyword module">from</span> <span class="token string">'@react-spring/web'</span>
</div><div data-line="4" class="highlight-line" data-highlighted="false">
</div><div data-line="5" class="highlight-line" data-highlighted="false"><span class="token keyword module">export</span> <span class="token keyword">const</span> <span class="token function-variable function"><span class="token maybe-class-name">AnimatedDialog</span></span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">{</span> isOpen<span class="token punctuation">,</span> onOpenCallback <span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token arrow operator">=&gt;</span> <span class="token punctuation">{</span>
</div><div data-line="6" class="highlight-line" data-highlighted="false">  <span class="token keyword">const</span> <span class="token punctuation">{</span> x<span class="token punctuation">,</span> backgroundColor<span class="token punctuation">,</span> o <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">useSpring</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
</div><div data-line="7" class="highlight-line" data-highlighted="false">    x<span class="token operator">:</span> isOpen <span class="token operator">?</span> <span class="token string">'0%'</span> <span class="token operator">:</span> <span class="token string">'-100%'</span><span class="token punctuation">,</span>
</div><div data-line="8" class="highlight-line" data-highlighted="false">    backgroundColor<span class="token operator">:</span> isOpen
</div><div data-line="9" class="highlight-line" data-highlighted="false">      <span class="token operator">?</span> <span class="token string">'var(--color-whiteblur)'</span>
</div><div data-line="10" class="highlight-line" data-highlighted="false">      <span class="token operator">:</span> <span class="token string">'var(--colors-white00)'</span><span class="token punctuation">,</span>
</div><div data-line="11" class="highlight-line" data-highlighted="false">    o<span class="token operator">:</span> isOpen <span class="token operator">?</span> <span class="token number">1</span> <span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
</div><div data-line="12" class="highlight-line" data-highlighted="true">    <span class="token function-variable function">onRest</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token arrow operator">=&gt;</span> <span class="token punctuation">{</span>
</div><div data-line="13" class="highlight-line" data-highlighted="true">      <span class="token keyword control-flow">if</span> <span class="token punctuation">(</span>isOpen <span class="token operator">&amp;&amp;</span> onOpenCallback<span class="token punctuation">)</span> <span class="token punctuation">{</span>
</div><div data-line="14" class="highlight-line" data-highlighted="true">        <span class="token function">onOpenCallback</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
</div><div data-line="15" class="highlight-line" data-highlighted="true">      <span class="token punctuation">}</span>
</div><div data-line="16" class="highlight-line" data-highlighted="true">    <span class="token punctuation">}</span><span class="token punctuation">,</span>
</div><div data-line="17" class="highlight-line" data-highlighted="false">  <span class="token punctuation">}</span><span class="token punctuation">)</span>
</div><div data-line="18" class="highlight-line" data-highlighted="false">
</div><div data-line="19" class="highlight-line" data-highlighted="false">  <span class="token keyword control-flow">return</span> <span class="token punctuation">(</span>
</div><div data-line="20" class="highlight-line" data-highlighted="false">    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Dialog.Root</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text"></span>
</div><div data-line="21" class="highlight-line" data-highlighted="false"><span class="token plain-text">      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Overlay</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span> backgroundColor <span class="token punctuation">}</span><span class="token punctuation">}</span></span> <span class="token punctuation">/&gt;</span></span><span class="token plain-text"></span>
</div><div data-line="22" class="highlight-line" data-highlighted="false"><span class="token plain-text">      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Modal</span></span>
        <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span>
          x<span class="token punctuation">,</span>
          backgroundColor<span class="token operator">:</span> o<span class="token punctuation">.</span><span class="token method function property-access">to</span><span class="token punctuation">(</span><span class="token parameter">o</span> <span class="token arrow operator">=&gt;</span> <span class="token string">'rgba(255,255,255,'</span> <span class="token operator">+</span> o <span class="token operator">+</span> <span class="token string">')'</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
        <span class="token punctuation">}</span><span class="token punctuation">}</span></span>
      <span class="token punctuation">/&gt;</span></span><span class="token plain-text"></span>
</div><div data-line="23" class="highlight-line" data-highlighted="false"><span class="token plain-text">    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">Dialog.Root</span></span><span class="token punctuation">&gt;</span></span>
</div><div data-line="24" class="highlight-line" data-highlighted="false">  <span class="token punctuation">)</span>
</div><div data-line="25" class="highlight-line" data-highlighted="false"><span class="token punctuation">}</span>
</div></code>`,
  `<code class="language-jsx" lines="1-2,20-23"><div data-line="1" class="highlight-line" data-highlighted="true"><span class="token keyword module">import</span> <span class="token imports"><span class="token operator">*</span> <span class="token keyword module">as</span> <span class="token maybe-class-name">Dialog</span></span> <span class="token keyword module">from</span> <span class="token string">'@radix-ui/react-dialog'</span>
</div><div data-line="2" class="highlight-line" data-highlighted="true"><span class="token keyword module">import</span> <span class="token imports"><span class="token punctuation">{</span> styled <span class="token punctuation">}</span></span> <span class="token keyword module">from</span> <span class="token string">'@stitches/react'</span>
</div><div data-line="3" class="highlight-line" data-highlighted="false"><span class="token keyword module">import</span> <span class="token imports"><span class="token punctuation">{</span> animated<span class="token punctuation">,</span> useSpring <span class="token punctuation">}</span></span> <span class="token keyword module">from</span> <span class="token string">'@react-spring/web'</span>
</div><div data-line="4" class="highlight-line" data-highlighted="false">
</div><div data-line="5" class="highlight-line" data-highlighted="false"><span class="token keyword module">export</span> <span class="token keyword">const</span> <span class="token function-variable function"><span class="token maybe-class-name">AnimatedDialog</span></span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">{</span> isOpen<span class="token punctuation">,</span> onOpenCallback <span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token arrow operator">=&gt;</span> <span class="token punctuation">{</span>
</div><div data-line="6" class="highlight-line" data-highlighted="false">  <span class="token keyword">const</span> <span class="token punctuation">{</span> x<span class="token punctuation">,</span> backgroundColor<span class="token punctuation">,</span> o <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">useSpring</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
</div><div data-line="7" class="highlight-line" data-highlighted="false">    x<span class="token operator">:</span> isOpen <span class="token operator">?</span> <span class="token string">'0%'</span> <span class="token operator">:</span> <span class="token string">'-100%'</span><span class="token punctuation">,</span>
</div><div data-line="8" class="highlight-line" data-highlighted="false">    backgroundColor<span class="token operator">:</span> isOpen
</div><div data-line="9" class="highlight-line" data-highlighted="false">      <span class="token operator">?</span> <span class="token string">'var(--color-whiteblur)'</span>
</div><div data-line="10" class="highlight-line" data-highlighted="false">      <span class="token operator">:</span> <span class="token string">'var(--colors-white00)'</span><span class="token punctuation">,</span>
</div><div data-line="11" class="highlight-line" data-highlighted="false">    o<span class="token operator">:</span> isOpen <span class="token operator">?</span> <span class="token number">1</span> <span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
</div><div data-line="12" class="highlight-line" data-highlighted="false">    <span class="token function-variable function">onRest</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token arrow operator">=&gt;</span> <span class="token punctuation">{</span>
</div><div data-line="13" class="highlight-line" data-highlighted="false">      <span class="token keyword control-flow">if</span> <span class="token punctuation">(</span>isOpen <span class="token operator">&amp;&amp;</span> onOpenCallback<span class="token punctuation">)</span> <span class="token punctuation">{</span>
</div><div data-line="14" class="highlight-line" data-highlighted="false">        <span class="token function">onOpenCallback</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
</div><div data-line="15" class="highlight-line" data-highlighted="false">      <span class="token punctuation">}</span>
</div><div data-line="16" class="highlight-line" data-highlighted="false">    <span class="token punctuation">}</span><span class="token punctuation">,</span>
</div><div data-line="17" class="highlight-line" data-highlighted="false">  <span class="token punctuation">}</span><span class="token punctuation">)</span>
</div><div data-line="18" class="highlight-line" data-highlighted="false">
</div><div data-line="19" class="highlight-line" data-highlighted="false">  <span class="token keyword control-flow">return</span> <span class="token punctuation">(</span>
</div><div data-line="20" class="highlight-line" data-highlighted="true">    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Dialog.Root</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text"></span>
</div><div data-line="21" class="highlight-line" data-highlighted="true"><span class="token plain-text">      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Overlay</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span> backgroundColor <span class="token punctuation">}</span><span class="token punctuation">}</span></span> <span class="token punctuation">/&gt;</span></span><span class="token plain-text"></span>
</div><div data-line="22" class="highlight-line" data-highlighted="true"><span class="token plain-text">      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Modal</span></span>
        <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span>
          x<span class="token punctuation">,</span>
          backgroundColor<span class="token operator">:</span> o<span class="token punctuation">.</span><span class="token method function property-access">to</span><span class="token punctuation">(</span><span class="token parameter">o</span> <span class="token arrow operator">=&gt;</span> <span class="token string">'rgba(255,255,255,'</span> <span class="token operator">+</span> o <span class="token operator">+</span> <span class="token string">')'</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
        <span class="token punctuation">}</span><span class="token punctuation">}</span></span>
      <span class="token punctuation">/&gt;</span></span><span class="token plain-text"></span>
</div><div data-line="23" class="highlight-line" data-highlighted="true"><span class="token plain-text">    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">Dialog.Root</span></span><span class="token punctuation">&gt;</span></span>
</div><div data-line="24" class="highlight-line" data-highlighted="false">  <span class="token punctuation">)</span>
</div><div data-line="25" class="highlight-line" data-highlighted="false"><span class="token punctuation">}</span>
</div></code>`,
]

export const HomeBlockMore = () => {
  const [springs, api] = useSprings(
    5,
    i => ({
      opacity: 0 === i ? 1 : 0,
      config: {
        precision: 0.0001,
      },
    }),
    []
  )

  const handleMouseEnter = (i: number) => () => {
    api.start(j => ({
      opacity: j === i ? 1 : 0,
    }))
  }

  return (
    <Section>
      <HomeBlockCopy
        subtitle="Wow, that's a lot!"
        title={`And there's even more`}
        cta={{
          label: 'Get started now',
          href: '/docs/get-started',
        }}>
        <List>
          {listItems.map((str, i) => (
            <ListItem
              key={str}
              onMouseEnter={handleMouseEnter(i)}
              style={{
                color: springs[i].opacity.to(
                  [0, 1],
                  ['var(--colors-steel40)', 'var(--colors-black)']
                ),
              }}>
              {str}
            </ListItem>
          ))}
        </List>
      </HomeBlockCopy>
      <HomeBlockCode>
        <code
          className="language-jsx"
          dangerouslySetInnerHTML={{ __html: dataFixtures[0] }}
          style={{
            visibility: 'hidden',
            userSelect: 'none',
          }}
        />
        {springs.map((style, i) => (
          <animated.code
            className="language-jsx"
            dangerouslySetInnerHTML={{ __html: dataFixtures[i] }}
            style={{ ...style, position: 'absolute', top: 30, left: 30 }}
          />
        ))}
      </HomeBlockCode>
    </Section>
  )
}

const List = styled('ul', {
  my: 0,
  pl: 26,
})

const ListItem = styled(animated.li, {
  cursor: 'pointer',
})

const HomeBlockCode = styled(Pre, {
  mt: '$40',
  position: 'relative',
})
