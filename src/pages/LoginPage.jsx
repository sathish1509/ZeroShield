import React, { useEffect, useRef, useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, Zap, Key, Users, Crown, Wrench } from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export const LoginPage = () => {
  const { login, ROLES } = useSecurity();
  const canvasRef = useRef(null);
  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const [email, setEmail] = useState('admin@zeroshield.io');
  const [password, setPassword] = useState('admin_secret_key_2026');

  const roleCredentials = {
    ADMIN: { email: 'admin@zeroshield.io', pass: 'admin_secret_key_2026' },
    ANALYST: { email: 'analyst@zeroshield.io', pass: 'analyst_sec_key_2026' },
    DEVOPS: { email: 'devops@zeroshield.io', pass: 'devops_infra_key_2026' }
  };

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setEmail(roleCredentials[roleKey].email);
    setPassword(roleCredentials[roleKey].pass);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1
    }));

    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(226, 232, 240, 0.6)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 140) {
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.3 - dist / 400})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    login(selectedRole);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 flex items-center justify-center p-4 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Solid Enterprise SaaS Login Card */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl p-8 border border-slate-200 shadow-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 rounded-2xl bg-slate-900 text-emerald-400 shadow-sm mb-1">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black font-sans tracking-tight text-slate-900">
            ZeroShield
          </h1>
          <p className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">
            Zero-Trust Access Control for Distributed APIs
          </p>
        </div>

        {/* Role Selector Buttons */}
        <div className="space-y-1.5 font-mono">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-900" />
            <span>Select User Access Profile:</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleRoleSelect('ADMIN')}
              className={`p-2.5 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedRole === 'ADMIN'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" /> Admin
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('ANALYST')}
              className={`p-2.5 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedRole === 'ANALYST'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> Analyst
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('DEVOPS')}
              className={`p-2.5 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedRole === 'DEVOPS'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-sky-400" /> DevOps
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono font-bold text-slate-700">Enterprise Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-mono transition-all focus:bg-white focus:border-slate-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-bold text-slate-700">Access Key / Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-mono transition-all focus:bg-white focus:border-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl black-btn font-mono text-xs font-bold tracking-wider uppercase shadow-xs flex items-center justify-center gap-2 group cursor-pointer transition-all"
          >
            <span>Launch SOC Command Vault as {ROLES[selectedRole]?.name}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span className="flex items-center gap-1 text-emerald-700 font-bold">
            <Zap className="w-3.5 h-3.5" /> mTLS 1.3 Ready
          </span>
          <button
            onClick={() => login(selectedRole)}
            className="text-slate-900 hover:underline flex items-center gap-1 font-bold cursor-pointer"
          >
            <Key className="w-3.5 h-3.5" /> 1-Click Demo Login
          </button>
        </div>
      </div>
    </div>
  );
};
