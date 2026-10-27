// The live constants, plus the one only the old site used: moved here from the project's constants.ts, so
// this folder's imports of '../constants' and '../../constants' still find what they named.
import { PROJECTS } from '../../constants';

export * from '../../constants';

// Redirect cards (e.g. Un-Selected Works) are navigation, not projects.
export const PROJECT_COUNT = PROJECTS.filter((p) => !p.isRedirect).length;
