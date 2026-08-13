/**
 * The four macro states of the KrishnaOS experience, per the UX flow doc
 * (welcome → tour | free | recruiter). Kept here (not just client-local)
 * since it's a natural candidate for query-param/route-based deep linking
 * that the server may eventually need to reason about (e.g. OG tags per mode).
 */
export type OsMode = 'welcome' | 'tour' | 'free' | 'recruiter';
