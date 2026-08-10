// Fork-local switch for the licensing subsystem.
//
// Upstream (Evolution Foundation) ships a licensing gate that (a) blocks every
// business route with HTTP 503 until the instance is activated against
// license.evolutionfoundation.com.br and (b) sends a heartbeat every 30 minutes
// carrying instance_id, uptime, version and message counters.
//
// This fork self-hosts on private infrastructure, so the default is OFF: no
// outbound licensing traffic, no gate. Set LICENSING_ENABLED=true in the
// environment to restore the upstream behaviour verbatim.
//
// Legal note — this repository is Apache License 2.0 (see LICENSE). Section 2
// grants an irrevocable licence to prepare Derivative Works, which covers
// modifying the source for our own deployment. The two additional conditions in
// LICENSE are NOT waived by this change and continue to apply:
//   a. the LOGO and copyright information in the frontend/console must stay;
//   b. any system built on top must clearly notify that Evolution API is used.
// If this fork is ever redistributed, Apache-2.0 §4(b) additionally requires
// marking the modified files as changed, and TRADEMARKS.md restricts use of the
// "Evolution API" name and logo on a modified distribution.
export const LICENSING_ENABLED = process.env.LICENSING_ENABLED === 'true';
