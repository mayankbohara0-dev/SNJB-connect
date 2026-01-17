export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    username: string | null
                    full_name: string | null
                    avatar_url: string | null
                    website: string | null
                    role: string | null
                    status: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    website?: string | null
                    role?: string | null
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    website?: string | null
                    role?: string | null
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            posts: {
                Row: {
                    id: string
                    content: string
                    image_url: string | null
                    user_id: string
                    created_at: string
                    type: 'text' | 'image' | 'confession' | 'poll'
                    tags: string[] | null
                    upvotes: number
                    downvotes: number
                    is_approved: boolean
                }
                Insert: {
                    id?: string
                    content: string
                    image_url?: string | null
                    user_id: string
                    created_at?: string
                    type?: 'text' | 'image' | 'confession' | 'poll'
                    tags?: string[] | null
                    upvotes?: number
                    downvotes?: number
                    is_approved?: boolean
                }
                Update: {
                    id?: string
                    content?: string
                    // ...
                }
            }
            poll_options: {
                Row: {
                    id: string
                    post_id: string
                    label: string
                    vote_count: number
                }
                Insert: {
                    id?: string
                    post_id: string
                    label: string
                    vote_count?: number
                }
                Update: {
                    vote_count?: number
                }
            }
            poll_votes: {
                Row: {
                    id: string
                    poll_option_id: string
                    user_id: string
                    post_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    poll_option_id: string
                    user_id: string
                    post_id: string
                    created_at?: string
                }
                Update: {}
            }
            notes: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    subject: string
                    semester: string
                    file_url: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    subject: string
                    semester: string
                    file_url: string
                    created_at?: string
                }
                Update: {}
            }
            events: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    description: string
                    event_date: string
                    location: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    description?: string
                    event_date: string
                    location: string
                    created_at?: string
                }
                Update: {}
            }
            event_rsvps: {
                Row: {
                    event_id: string
                    user_id: string
                    created_at: string
                }
                Insert: {
                    event_id: string
                    user_id: string
                    created_at?: string
                }
                Update: {}
            }
        }
        Views: {
            public_posts: {
                Row: {
                    id: string
                    content: string
                    image_url: string | null
                    created_at: string
                    type: 'text' | 'image' | 'confession' | 'poll'
                    tags: string[] | null
                    author_alias: string
                }
            }
        }
    }
}
