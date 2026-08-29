/**
 * Dashboard nav active state. Exact match on the section root; prefix match on nested routes.
 * Mobile previously used only `pathname === href`, so /programs/xyz never highlighted Courses.
 */
export function isNavActive(pathname: string | null | undefined, href: string, rootHref: string): boolean {
    if (!pathname) return false
    if (pathname === href) return true
    if (href === rootHref) return false
    return pathname.startsWith(`${href}/`) || pathname === href
}
