// Authentic Lucide icon nodes. Only this small, consistent set is bundled.
import { createElement, ArrowRight, ArrowLeft, ArrowUp, ArrowUpRight, Search, ShoppingBag, X, Menu, MapPin, ChevronDown, ChevronLeft, ChevronRight, Check, Clock3, Truck, ShieldCheck, PackageCheck, Plus, Minus, SlidersHorizontal, CircleAlert, CheckCircle2, Eye, RotateCcw, MessageCircle, Trash2, Copy, Star } from 'lucide';
const icons = { 'arrow-right': ArrowRight, 'arrow-left': ArrowLeft, 'arrow-up': ArrowUp, 'arrow-up-right': ArrowUpRight, search: Search, bag: ShoppingBag, x: X, menu: Menu, pin: MapPin, 'chevron-down': ChevronDown, 'chevron-left': ChevronLeft, 'chevron-right': ChevronRight, check: Check, clock: Clock3, truck: Truck, shield: ShieldCheck, package: PackageCheck, plus: Plus, minus: Minus, filter: SlidersHorizontal, alert: CircleAlert, success: CheckCircle2, eye: Eye, reset: RotateCcw, help: MessageCircle, trash: Trash2, copy: Copy, star: Star };
export function icon(name, size = 20) {
  if (!icons[name]) return '';
  return createElement(icons[name], { width: size, height: size, 'stroke-width': 1.6, 'aria-hidden': 'true', class: 'icon' }).outerHTML;
}
export function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(element => { element.innerHTML = icon(element.dataset.icon, Number(element.dataset.size) || 20); });
}
