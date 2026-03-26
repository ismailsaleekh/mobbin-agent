// Mobbin category catalogs — all screen patterns, flow actions, and UI elements
// with exact URL-encoded values from docs/reference/url-patterns.md.
//
// URL template:
//   https://mobbin.com/search/apps/{platform}?content_type={type}&sort={sort}&filter={filterKey}.{encoded}

// ---------------------------------------------------------------------------
// Screen Patterns (99 entries)
// Filter key: screenPatterns
// ---------------------------------------------------------------------------

export const SCREEN_PATTERNS = [
  // New User Experience (6)
  { name: 'Account Setup',              encoded: 'Account+Setup',                       slug: 'account-setup',               group: 'New User Experience' },
  { name: 'Guided Tour & Tutorial',     encoded: 'Guided+Tour+%26+Tutorial',            slug: 'guided-tour-tutorial',        group: 'New User Experience' },
  { name: 'Splash Screen',             encoded: 'Splash+Screen',                       slug: 'splash-screen',               group: 'New User Experience' },
  { name: 'Signup',                     encoded: 'Signup',                              slug: 'signup',                      group: 'New User Experience' },
  { name: 'Verification',              encoded: 'Verification',                        slug: 'verification',                group: 'New User Experience' },
  { name: 'Welcome & Get Started',     encoded: 'Welcome+%26+Get+Started',             slug: 'welcome-get-started',         group: 'New User Experience' },

  // Account Management (5)
  { name: 'Delete & Deactivate Account', encoded: 'Delete+%26+Deactivate+Account',     slug: 'delete-deactivate-account',   group: 'Account Management' },
  { name: 'Forgot Password',           encoded: 'Forgot+Password',                     slug: 'forgot-password',             group: 'Account Management' },
  { name: 'Login',                      encoded: 'Login',                               slug: 'login',                       group: 'Account Management' },
  { name: 'My Account & Profile',      encoded: 'My+Account+%26+Profile',              slug: 'my-account-profile',          group: 'Account Management' },
  { name: 'Settings & Preferences',    encoded: 'Settings+%26+Preferences',            slug: 'settings-preferences',        group: 'Account Management' },

  // Communication (15)
  { name: 'About',                      encoded: 'About',                               slug: 'about',                       group: 'Communication' },
  { name: 'Acknowledgement & Success', encoded: 'Acknowledgement+%26+Success',         slug: 'acknowledgement-success',     group: 'Communication' },
  { name: 'Action Option',             encoded: 'Action+Option',                       slug: 'action-option',               group: 'Communication' },
  { name: 'Confirmation',              encoded: 'Confirmation',                        slug: 'confirmation',                group: 'Communication' },
  { name: 'Empty State',               encoded: 'Empty+State',                         slug: 'empty-state',                 group: 'Communication' },
  { name: 'Error',                      encoded: 'Error',                               slug: 'error',                       group: 'Communication' },
  { name: 'Feature Info',              encoded: 'Feature+Info',                        slug: 'feature-info',                group: 'Communication' },
  { name: 'Feedback',                  encoded: 'Feedback',                            slug: 'feedback',                    group: 'Communication' },
  { name: 'Help & Support',            encoded: 'Help+%26+Support',                    slug: 'help-support',                group: 'Communication' },
  { name: 'Loading',                    encoded: 'Loading',                             slug: 'loading',                     group: 'Communication' },
  { name: 'Permission',                encoded: 'Permission',                          slug: 'permission',                  group: 'Communication' },
  { name: 'Privacy Policy',            encoded: 'Privacy+Policy',                      slug: 'privacy-policy',              group: 'Communication' },
  { name: 'Pull to Refresh',           encoded: 'Pull+to+Refresh',                     slug: 'pull-to-refresh',             group: 'Communication' },
  { name: 'Suggestions & Similar Items', encoded: 'Suggestions+%26+Similar+Items',     slug: 'suggestions-similar-items',   group: 'Communication' },
  { name: 'Terms & Conditions',        encoded: 'Terms+%26+Conditions',                slug: 'terms-conditions',            group: 'Communication' },

  // Commerce & Finance (12)
  { name: 'Billing',                    encoded: 'Billing',                             slug: 'billing',                     group: 'Commerce & Finance' },
  { name: 'Cart & Bag',                encoded: 'Cart+%26+Bag',                        slug: 'cart-bag',                    group: 'Commerce & Finance' },
  { name: 'Checkout',                  encoded: 'Checkout',                            slug: 'checkout',                    group: 'Commerce & Finance' },
  { name: 'Order Confirmation',        encoded: 'Order+Confirmation',                  slug: 'order-confirmation',          group: 'Commerce & Finance' },
  { name: 'Order Detail',              encoded: 'Order+Detail',                        slug: 'order-detail',                group: 'Commerce & Finance' },
  { name: 'Order History',             encoded: 'Order+History',                       slug: 'order-history',               group: 'Commerce & Finance' },
  { name: 'Payment Method',            encoded: 'Payment+Method',                      slug: 'payment-method',              group: 'Commerce & Finance' },
  { name: 'Pricing',                    encoded: 'Pricing',                             slug: 'pricing',                     group: 'Commerce & Finance' },
  { name: 'Promotions & Rewards',      encoded: 'Promotions+%26+Rewards',              slug: 'promotions-rewards',          group: 'Commerce & Finance' },
  { name: 'Shop & Storefront',         encoded: 'Shop+%26+Storefront',                 slug: 'shop-storefront',             group: 'Commerce & Finance' },
  { name: 'Subscription & Paywall',    encoded: 'Subscription+%26+Paywall',            slug: 'subscription-paywall',        group: 'Commerce & Finance' },
  { name: 'Wallet & Balance',          encoded: 'Wallet+%26+Balance',                  slug: 'wallet-balance',              group: 'Commerce & Finance' },

  // Social (11)
  { name: 'Achievements & Awards',     encoded: 'Achievements+%26+Awards',             slug: 'achievements-awards',         group: 'Social' },
  { name: 'Chat Detail',               encoded: 'Chat+Detail',                         slug: 'chat-detail',                 group: 'Social' },
  { name: 'Comments',                  encoded: 'Comments',                            slug: 'comments',                    group: 'Social' },
  { name: 'Followers & Following',     encoded: 'Followers+%26+Following',             slug: 'followers-following',          group: 'Social' },
  { name: 'Groups & Community',        encoded: 'Groups+%26+Community',                slug: 'groups-community',            group: 'Social' },
  { name: 'Invite Teammates',          encoded: 'Invite+Teammates',                    slug: 'invite-teammates',            group: 'Social' },
  { name: 'Leaderboard',               encoded: 'Leaderboard',                         slug: 'leaderboard',                 group: 'Social' },
  { name: 'Notifications',             encoded: 'Notifications',                       slug: 'notifications',               group: 'Social' },
  { name: 'Reviews & Ratings',         encoded: 'Reviews+%26+Ratings',                 slug: 'reviews-ratings',             group: 'Social' },
  { name: 'Social Feed',               encoded: 'Social+Feed',                         slug: 'social-feed',                 group: 'Social' },
  { name: 'User / Group Profile',      encoded: 'User+%2F+Group+Profile',              slug: 'user-group-profile',          group: 'Social' },

  // Content (18)
  { name: 'Article Detail',            encoded: 'Article+Detail',                      slug: 'article-detail',              group: 'Content' },
  { name: 'Augmented Reality',         encoded: 'Augmented+Reality',                   slug: 'augmented-reality',           group: 'Content' },
  { name: 'Browse & Discover',         encoded: 'Browse+%26+Discover',                 slug: 'browse-discover',             group: 'Content' },
  { name: 'Class & Lesson Detail',     encoded: 'Class+%26+Lesson+Detail',             slug: 'class-lesson-detail',         group: 'Content' },
  { name: 'Emails & Messages',         encoded: 'Emails+%26+Messages',                 slug: 'emails-messages',             group: 'Content' },
  { name: 'Event Detail',              encoded: 'Event+Detail',                        slug: 'event-detail',                group: 'Content' },
  { name: 'Goal & Task',               encoded: 'Goal+%26+Task',                       slug: 'goal-task',                   group: 'Content' },
  { name: 'Home',                       encoded: 'Home',                                slug: 'home',                        group: 'Content' },
  { name: 'News Feed',                 encoded: 'News+Feed',                           slug: 'news-feed',                   group: 'Content' },
  { name: 'Note Detail',               encoded: 'Note+Detail',                         slug: 'note-detail',                 group: 'Content' },
  { name: 'Other Content',             encoded: 'Other+Content',                       slug: 'other-content',               group: 'Content' },
  { name: 'Post Detail',               encoded: 'Post+Detail',                         slug: 'post-detail',                 group: 'Content' },
  { name: 'Product Detail',            encoded: 'Product+Detail',                      slug: 'product-detail',              group: 'Content' },
  { name: 'Quiz',                       encoded: 'Quiz',                                slug: 'quiz',                        group: 'Content' },
  { name: 'Recipe Detail',             encoded: 'Recipe+Detail',                       slug: 'recipe-detail',               group: 'Content' },
  { name: 'Song & Podcast Detail',     encoded: 'Song+%26+Podcast+Detail',             slug: 'song-podcast-detail',         group: 'Content' },
  { name: 'Stories',                    encoded: 'Stories',                             slug: 'stories',                     group: 'Content' },
  { name: 'TV Show & Movie Detail',    encoded: 'TV+Show+%26+Movie+Detail',            slug: 'tv-show-movie-detail',        group: 'Content' },

  // Action (23)
  { name: 'Add & Create',              encoded: 'Add+%26+Create',                      slug: 'add-create',                  group: 'Action' },
  { name: 'Ban & Block',               encoded: 'Ban+%26+Block',                       slug: 'ban-block',                   group: 'Action' },
  { name: 'Cancel',                     encoded: 'Cancel',                              slug: 'cancel',                      group: 'Action' },
  { name: 'Delete',                     encoded: 'Delete',                              slug: 'delete',                      group: 'Action' },
  { name: 'Draw & Annotate',           encoded: 'Draw+%26+Annotate',                   slug: 'draw-annotate',               group: 'Action' },
  { name: 'Edit',                       encoded: 'Edit',                                slug: 'edit',                        group: 'Action' },
  { name: 'Favorite & Pin',            encoded: 'Favorite+%26+Pin',                    slug: 'favorite-pin',                group: 'Action' },
  { name: 'Filter & Sort',             encoded: 'Filter+%26+Sort',                     slug: 'filter-sort',                 group: 'Action' },
  { name: 'Flag & Report',             encoded: 'Flag+%26+Report',                     slug: 'flag-report',                 group: 'Action' },
  { name: 'Follow & Subscribe',        encoded: 'Follow+%26+Subscribe',                slug: 'follow-subscribe',            group: 'Action' },
  { name: 'Invite & Refer Friends',    encoded: 'Invite+%26+Refer+Friends',            slug: 'invite-refer-friends',        group: 'Action' },
  { name: 'Like & Upvote',             encoded: 'Like+%26+Upvote',                     slug: 'like-upvote',                 group: 'Action' },
  { name: 'Move',                       encoded: 'Move',                                slug: 'move',                        group: 'Action' },
  { name: 'Other Action',              encoded: 'Other+Action',                        slug: 'other-action',                group: 'Action' },
  { name: 'Reorder',                    encoded: 'Reorder',                             slug: 'reorder',                     group: 'Action' },
  { name: 'Save',                       encoded: 'Save',                                slug: 'save',                        group: 'Action' },
  { name: 'Search',                     encoded: 'Search',                              slug: 'search',                      group: 'Action' },
  { name: 'Select',                     encoded: 'Select',                              slug: 'select',                      group: 'Action' },
  { name: 'Set',                        encoded: 'Set',                                 slug: 'set',                         group: 'Action' },
  { name: 'Schedule',                   encoded: 'Schedule',                            slug: 'schedule',                    group: 'Action' },
  { name: 'Share',                      encoded: 'Share',                               slug: 'share',                       group: 'Action' },
  { name: 'Transfer & Send Money',     encoded: 'Transfer+%26+Send+Money',             slug: 'transfer-send-money',         group: 'Action' },
  { name: 'Upload & Download',         encoded: 'Upload+%26+Download',                 slug: 'upload-download',             group: 'Action' },

  // Data (3)
  { name: 'Charts',                     encoded: 'Charts',                              slug: 'charts',                      group: 'Data' },
  { name: 'Dashboard',                 encoded: 'Dashboard',                           slug: 'dashboard',                   group: 'Data' },
  { name: 'Progress',                  encoded: 'Progress',                            slug: 'progress',                    group: 'Data' },

  // My Stuff (6)
  { name: 'Bookmarks & Collections',   encoded: 'Bookmarks+%26+Collections',           slug: 'bookmarks-collections',       group: 'My Stuff' },
  { name: 'Downloads & Available Offline', encoded: 'Downloads+%26+Available+Offline',  slug: 'downloads-available-offline', group: 'My Stuff' },
  { name: 'History',                    encoded: 'History',                             slug: 'history',                     group: 'My Stuff' },
  { name: 'Map',                        encoded: 'Map',                                 slug: 'map',                         group: 'My Stuff' },
  { name: 'Media Player',              encoded: 'Media+Player',                        slug: 'media-player',                group: 'My Stuff' },
  { name: 'Calendar',                  encoded: 'Calendar',                            slug: 'calendar',                    group: 'My Stuff' },
];

// ---------------------------------------------------------------------------
// Flow Actions (8 entries)
// Filter key: flowActions
// ---------------------------------------------------------------------------

export const FLOW_ACTIONS = [
  { name: 'Browsing Tutorial',            encoded: 'Browsing+Tutorial',                  slug: 'browsing-tutorial' },
  { name: 'Chatting & Sending Messages',  encoded: 'Chatting+%26+Sending+Messages',      slug: 'chatting-sending-messages' },
  { name: 'Creating Account',             encoded: 'Creating+Account',                   slug: 'creating-account' },
  { name: 'Editing Profile',              encoded: 'Editing+Profile',                     slug: 'editing-profile' },
  { name: 'Filtering & Sorting',          encoded: 'Filtering+%26+Sorting',               slug: 'filtering-sorting' },
  { name: 'Logging In',                   encoded: 'Logging+In',                          slug: 'logging-in' },
  { name: 'Onboarding',                   encoded: 'Onboarding',                          slug: 'onboarding' },
  { name: 'Subscribing & Upgrading',      encoded: 'Subscribing+%26+Upgrading',           slug: 'subscribing-upgrading' },
];

// ---------------------------------------------------------------------------
// UI Elements (7 entries)
// Filter key: screenElements
// ---------------------------------------------------------------------------

export const UI_ELEMENTS = [
  { name: 'Banner',              encoded: 'Banner',              slug: 'banner' },
  { name: 'Bottom Sheet',       encoded: 'Bottom+Sheet',        slug: 'bottom-sheet' },
  { name: 'Button',             encoded: 'Button',              slug: 'button' },
  { name: 'Dropdown Menu',      encoded: 'Dropdown+Menu',       slug: 'dropdown-menu' },
  { name: 'Progress Indicator', encoded: 'Progress+Indicator',  slug: 'progress-indicator' },
  { name: 'Stacked List',       encoded: 'Stacked+List',        slug: 'stacked-list' },
  { name: 'Text Field',         encoded: 'Text+Field',          slug: 'text-field' },
];

// ---------------------------------------------------------------------------
// Platforms
// ---------------------------------------------------------------------------

export const PLATFORMS = [
  { name: 'mobile', searchParam: 'ios' },
  { name: 'web',    searchParam: 'web' },
];

// ---------------------------------------------------------------------------
// Sort orders
// ---------------------------------------------------------------------------

export const SORT_ORDERS = ['trending', 'mostPopular'];
