'use client';

import { UserRole } from "@/lib/auth/types";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";

function RoleIcon({ role, size=12 }:{ role:UserRole; size?:number }) {
  const c:Record<UserRole,string>={root:'#a78bfa',admin:'#60a5fa',user:'#34d399'};
  if (role==='root')  return <ShieldAlert  size={size} color={c.root}/>;
  if (role==='admin') return <ShieldCheck size={size} color={c.admin}/>;
  return <Shield size={size} color={c.user}/>;
}

export { RoleIcon };