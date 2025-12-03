/**
 * Route animation classes for use with animate.enter and animate.leave
 *
 * Usage in component:
 * ```html
 * <div [animate.enter]="'route-enter'" [animate.leave]="'route-leave'">
 *   <router-outlet></router-outlet>
 * </div>
 * ```
 *
 * The CSS animations are defined in styles.scss
 */
export const ROUTE_ANIMATION_CLASSES = {
  enter: 'route-enter',
  leave: 'route-leave',
} as const;
