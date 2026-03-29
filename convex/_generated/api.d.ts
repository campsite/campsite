/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accountShell from "../accountShell.js";
import type * as adminOps from "../adminOps.js";
import type * as callRooms from "../callRooms.js";
import type * as callsRealtime from "../callsRealtime.js";
import type * as collaboration from "../collaboration.js";
import type * as content from "../content.js";
import type * as digests from "../digests.js";
import type * as engagement from "../engagement.js";
import type * as externalPlatforms from "../externalPlatforms.js";
import type * as files from "../files.js";
import type * as legacy from "../legacy.js";
import type * as media from "../media.js";
import type * as notes from "../notes.js";
import type * as notifications from "../notifications.js";
import type * as onboarding from "../onboarding.js";
import type * as organizationAdmin from "../organizationAdmin.js";
import type * as pinsBookmarks from "../pinsBookmarks.js";
import type * as projectPreferences from "../projectPreferences.js";
import type * as projectViews from "../projectViews.js";
import type * as realtime from "../realtime.js";
import type * as resourceMentions from "../resourceMentions.js";
import type * as search from "../search.js";
import type * as threads from "../threads.js";
import type * as users from "../users.js";
import type * as workspace from "../workspace.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accountShell: typeof accountShell;
  adminOps: typeof adminOps;
  callRooms: typeof callRooms;
  callsRealtime: typeof callsRealtime;
  collaboration: typeof collaboration;
  content: typeof content;
  digests: typeof digests;
  engagement: typeof engagement;
  externalPlatforms: typeof externalPlatforms;
  files: typeof files;
  legacy: typeof legacy;
  media: typeof media;
  notes: typeof notes;
  notifications: typeof notifications;
  onboarding: typeof onboarding;
  organizationAdmin: typeof organizationAdmin;
  pinsBookmarks: typeof pinsBookmarks;
  projectPreferences: typeof projectPreferences;
  projectViews: typeof projectViews;
  realtime: typeof realtime;
  resourceMentions: typeof resourceMentions;
  search: typeof search;
  threads: typeof threads;
  users: typeof users;
  workspace: typeof workspace;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
