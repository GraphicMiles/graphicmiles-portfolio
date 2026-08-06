import { ReactNode } from "react";
import { Database, Zap, Code, ShieldAlert, Cpu } from "lucide-react";

export const ProjectVisuals = {
  Nearspace: () => (
    <div className="w-full h-full bg-[#f8f9fa] rounded relative overflow-hidden flex flex-col font-mono text-xs">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      
      {/* Map UI Header */}
      <div className="h-10 bg-white border-b border-gray-200 flex items-center px-4 justify-between relative z-10 shadow-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <Database className="w-3.5 h-3.5" />
          <span>Realtime DB</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-[10px] font-bold">ONLINE</span>
        </div>
      </div>
      
      {/* Map Content */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {/* Geohash Grid representation */}
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 opacity-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border-r border-b border-gray-400 flex items-center justify-center text-[10px] text-gray-400">
              s{Math.floor(Math.random() * 9)}v{Math.floor(Math.random() * 9)}
            </div>
          ))}
        </div>
        
        {/* User Node */}
        <div className="relative z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-blue-500/10 bg-blue-50/30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-blue-500/20 bg-blue-50/50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-blue-500/40 bg-blue-50/80 animate-ping duration-[3000ms]" />
          
          {/* Center Pin */}
          <div className="relative w-4 h-4 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.6)] border-2 border-white flex items-center justify-center z-20">
            <div className="w-1 h-1 bg-white rounded-full" />
          </div>
          
          {/* Connecting lines */}
          <svg className="absolute top-1/2 left-1/2 overflow-visible z-10 pointer-events-none" style={{ width: 0, height: 0 }}>
            <line x1="0" y1="0" x2="-60" y2="-40" stroke="rgba(37,99,235,0.3)" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="0" y1="0" x2="80" y2="-20" stroke="rgba(37,99,235,0.3)" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="0" y1="0" x2="40" y2="70" stroke="rgba(37,99,235,0.3)" strokeWidth="1" strokeDasharray="2 2" />
          </svg>
          
          {/* Nearby builders */}
          <div className="absolute top-1/2 left-1/2 -translate-x-[68px] -translate-y-[48px] w-3 h-3 bg-gray-800 rounded-full border-2 border-white z-20" />
          <div className="absolute top-1/2 left-1/2 translate-x-[72px] -translate-y-[28px] w-3 h-3 bg-gray-800 rounded-full border-2 border-white z-20" />
          <div className="absolute top-1/2 left-1/2 translate-x-[32px] translate-y-[62px] w-3 h-3 bg-gray-800 rounded-full border-2 border-white z-20" />
        </div>
        
        {/* Floating cards */}
        <div className="absolute bottom-4 left-4 bg-white shadow-sm border border-gray-200 rounded p-2 z-20">
          <div className="text-[10px] text-gray-500 mb-1">RADIUS QUERY</div>
          <div className="font-bold">5.0 km</div>
        </div>
      </div>
    </div>
  ),

  Chan: () => (
    <div className="w-full h-full bg-[#111111] rounded relative overflow-hidden flex flex-col font-sans text-white border border-gray-800">
      {/* Video Area */}
      <div className="flex-1 bg-black relative flex items-center justify-center">
        <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-widest flex items-center gap-1 z-20">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
        </div>
        
        {/* Video Player Mock */}
        <div className="w-full h-full relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
          
          {/* Simulated content (abstract shapes for video) */}
          <div className="absolute inset-0 opacity-40 flex items-center justify-center overflow-hidden">
            <div className="w-64 h-64 bg-blue-500/20 rounded-full blur-3xl absolute -left-10" />
            <div className="w-64 h-64 bg-purple-500/20 rounded-full blur-3xl absolute right-10 top-10" />
          </div>
          
          {/* Controls */}
          <div className="absolute bottom-4 left-4 right-4 z-20">
            <div className="w-full h-1 bg-gray-800 rounded-full mb-3 overflow-hidden">
              <div className="h-full bg-red-500 w-2/3 relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
              <div className="flex gap-4">
                <span>14:23 / 21:05</span>
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-400" /> Sync: ~42ms</span>
              </div>
              <div className="px-2 py-0.5 border border-gray-700 rounded text-gray-300">H.264 Remux</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Watch Party UI Bottom Bar */}
      <div className="h-16 bg-[#1a1a1a] border-t border-gray-800 flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-[#1a1a1a] flex items-center justify-center font-bold text-xs">R</div>
            <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-[#1a1a1a] flex items-center justify-center font-bold text-xs">J</div>
            <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-[#1a1a1a] flex items-center justify-center font-bold text-xs">A</div>
          </div>
          <div className="text-[10px] font-mono text-gray-400">3 VIEWING</div>
        </div>
        
        <div className="bg-gray-800 rounded px-3 py-1.5 flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="font-mono text-gray-300">Connected via LiveKit</span>
        </div>
      </div>
    </div>
  ),

  Toddler: () => (
    <div className="w-full h-full bg-[#0d1117] rounded relative overflow-hidden flex flex-col font-mono text-[11px] border border-gray-800 text-gray-300 shadow-inner">
      {/* Editor Tab Bar */}
      <div className="flex border-b border-gray-800 bg-[#010409]">
        <div className="px-4 py-2 border-r border-gray-800 bg-[#0d1117] text-gray-300 border-t-2 border-t-blue-500 flex items-center gap-2">
          <Code className="w-3 h-3 text-blue-400" /> main.cpp
        </div>
        <div className="px-4 py-2 border-r border-gray-800 text-gray-600 flex items-center gap-2">
          <ShieldAlert className="w-3 h-3 text-yellow-500/50" /> SKILL.md
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Line Numbers */}
        <div className="w-8 py-4 bg-[#010409] border-r border-gray-800 flex flex-col text-right pr-2 text-gray-600 select-none">
          {Array.from({ length: 12 }).map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        
        {/* Code Content */}
        <div className="flex-1 py-4 pl-4 overflow-hidden relative leading-[1.6]">
          <div><span className="text-purple-400">#include</span> <span className="text-orange-300">&lt;llama.h&gt;</span></div>
          <div><span className="text-purple-400">#include</span> <span className="text-orange-300">"jni.h"</span></div>
          <div className="text-gray-500 italic mt-2">// Direct CPU inference via JNI on Android</div>
          <div><span className="text-blue-400">extern</span> <span className="text-blue-400">"C"</span></div>
          <div><span className="text-green-400">JNIEXPORT</span> <span className="text-blue-400">jstring</span> <span className="text-green-400">JNICALL</span></div>
          <div><span className="text-yellow-200">Java_com_toddler_ai_LlamaCore_streamToken</span>(</div>
          <div className="pl-4">JNIEnv* env,</div>
          <div className="pl-4">jobject thiz,</div>
          <div className="pl-4">jstring prompt) {'{'}</div>
          
          <div className="pl-4 mt-2">
            <span className="text-blue-400">auto</span> ctx = <span className="text-yellow-200">llama_init_from_file</span>(<span className="text-orange-300">"model.gguf"</span>);
          </div>
          <div className="pl-4">
            <span className="text-gray-500 italic">// AI Generation in progress...</span>
          </div>
          <div className="pl-4 flex items-center">
            <span className="text-blue-400">return</span> env-&gt;<span className="text-yellow-200">NewStringUTF</span>(token<span className="inline-block w-2 h-3.5 bg-gray-400 ml-0.5 animate-pulse" />
          </div>
        </div>
        
        {/* Status Bar Overlay */}
        <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur border border-gray-800 rounded p-2 flex items-center gap-3 z-20 shadow-lg">
          <Cpu className="w-4 h-4 text-green-400" />
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-500">LOCAL INFERENCE</span>
            <span className="text-green-400 font-bold">14.2 tok/s</span>
          </div>
        </div>
      </div>
    </div>
  )
};
