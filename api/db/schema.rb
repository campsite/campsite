# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2024_12_12_002307) do
  create_table "attachments", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.text "file_path", null: false
    t.string "file_type", null: false
    t.string "subject_type"
    t.bigint "subject_id", unsigned: true
    t.string "preview_file_path"
    t.integer "width"
    t.integer "height"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "duration"
    t.string "transcription_job_id"
    t.string "transcription_job_status"
    t.text "transcription_vtt", size: :medium
    t.integer "position"
    t.string "name"
    t.integer "size"
    t.string "remote_figma_node_id"
    t.integer "remote_figma_node_type"
    t.text "remote_figma_node_name"
    t.bigint "figma_file_id", unsigned: true
    t.integer "comments_count", default: 0, null: false
    t.text "figma_share_url"
    t.text "imgix_video_file_path"
    t.boolean "no_video_track", default: false, null: false
    t.string "gallery_id"
    t.index ["figma_file_id", "remote_figma_node_id"], name: "index_attachments_on_figma_file_id_and_remote_figma_node_id"
    t.index ["public_id"], name: "index_attachments_on_public_id", unique: true
    t.index ["subject_type", "subject_id"], name: "index_attachments_on_subject"
    t.index ["transcription_job_status"], name: "index_attachments_on_transcription_job_status"
  end

  create_table "bookmarks", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.string "title", null: false
    t.text "url", null: false
    t.integer "position", default: 0
    t.string "bookmarkable_type", null: false
    t.bigint "bookmarkable_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["bookmarkable_type", "bookmarkable_id"], name: "index_bookmarks_on_bookmarkable"
    t.index ["position"], name: "index_bookmarks_on_position"
    t.index ["public_id"], name: "index_bookmarks_on_public_id", unique: true
  end

  create_table "call_peers", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "call_id", null: false, unsigned: true
    t.bigint "organization_membership_id", unsigned: true
    t.datetime "joined_at", null: false
    t.datetime "left_at"
    t.string "remote_peer_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name"
    t.bigint "user_id", unsigned: true
    t.index ["call_id", "organization_membership_id"], name: "index_call_peers_on_call_id_and_organization_membership_id"
    t.index ["call_id"], name: "index_call_peers_on_call_id"
    t.index ["joined_at"], name: "index_call_peers_on_joined_at"
    t.index ["left_at"], name: "index_call_peers_on_left_at"
    t.index ["organization_membership_id"], name: "index_call_peers_on_organization_membership_id"
    t.index ["remote_peer_id"], name: "index_call_peers_on_remote_peer_id", unique: true
    t.index ["user_id"], name: "index_call_peers_on_user_id"
  end

  create_table "call_recording_chat_links", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "call_recording_id", null: false, unsigned: true
    t.text "url", null: false
    t.string "sender_remote_peer_id", null: false
    t.string "sender_name", null: false
    t.datetime "sent_at", null: false
    t.text "message", null: false
    t.string "remote_message_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["call_recording_id"], name: "index_call_recording_chat_links_on_call_recording_id"
  end

  create_table "call_recording_speakers", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name", null: false
    t.bigint "call_recording_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "call_peer_id", null: false, unsigned: true
    t.index ["call_peer_id"], name: "index_call_recording_speakers_on_call_peer_id"
    t.index ["call_recording_id", "name"], name: "index_call_recording_speakers_on_call_recording_id_and_name", unique: true
    t.index ["call_recording_id"], name: "index_call_recording_speakers_on_call_recording_id"
  end

  create_table "call_recording_summary_sections", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "call_recording_id", null: false, unsigned: true
    t.integer "status", default: 0, null: false
    t.integer "section", null: false
    t.text "prompt", size: :medium
    t.text "response", size: :medium
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["call_recording_id"], name: "index_call_recording_summary_sections_on_call_recording_id"
    t.index ["status"], name: "index_call_recording_summary_sections_on_status"
  end

  create_table "call_recordings", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.datetime "started_at", null: false
    t.datetime "stopped_at"
    t.datetime "transcription_started_at"
    t.string "remote_beam_id", null: false
    t.string "remote_job_id", null: false
    t.string "remote_recording_id"
    t.string "remote_transcription_id"
    t.text "file_path"
    t.text "transcript_json_file_path"
    t.text "transcript_srt_file_path"
    t.text "transcript_txt_file_path"
    t.integer "size"
    t.integer "max_width"
    t.integer "max_height"
    t.bigint "call_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "transcription_vtt", size: :medium
    t.datetime "transcription_succeeded_at"
    t.datetime "transcription_failed_at"
    t.integer "duration"
    t.text "chat_file_path"
    t.index ["call_id"], name: "index_call_recordings_on_call_id"
    t.index ["public_id"], name: "index_call_recordings_on_public_id", unique: true
    t.index ["remote_beam_id"], name: "index_call_recordings_on_remote_beam_id"
    t.index ["remote_job_id"], name: "index_call_recordings_on_remote_job_id"
    t.index ["remote_recording_id"], name: "index_call_recordings_on_remote_recording_id"
    t.index ["remote_transcription_id"], name: "index_call_recordings_on_remote_transcription_id"
  end

  create_table "call_room_invitations", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "call_room_id", null: false, unsigned: true
    t.bigint "creator_organization_membership_id", null: false, unsigned: true
    t.json "invitee_organization_membership_ids", null: false
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["call_room_id"], name: "index_call_room_invitations_on_call_room_id"
    t.index ["creator_organization_membership_id"], name: "idx_on_creator_organization_membership_id_2eb6938e76"
  end

  create_table "call_rooms", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "subject_type"
    t.bigint "subject_id", unsigned: true
    t.string "remote_room_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "organization_id", null: false, unsigned: true
    t.string "public_id", limit: 12, null: false
    t.integer "source"
    t.integer "creator_id"
    t.index ["creator_id"], name: "index_call_rooms_on_creator_id"
    t.index ["organization_id"], name: "index_call_rooms_on_organization_id"
    t.index ["public_id"], name: "index_call_rooms_on_public_id", unique: true
    t.index ["remote_room_id"], name: "index_call_rooms_on_remote_room_id"
    t.index ["subject_type", "subject_id"], name: "index_call_rooms_on_subject"
  end

  create_table "calls", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.datetime "started_at", null: false
    t.datetime "stopped_at"
    t.string "remote_session_id", null: false
    t.bigint "call_room_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "public_id", limit: 12, null: false
    t.string "title"
    t.text "summary", size: :medium
    t.string "generated_title"
    t.integer "generated_title_status", default: 0, null: false
    t.integer "recordings_duration", default: 0, null: false
    t.bigint "project_id", unsigned: true
    t.integer "project_permission", default: 0, null: false
    t.integer "generated_summary_status", default: 0, null: false
    t.index ["call_room_id"], name: "index_calls_on_call_room_id"
    t.index ["project_id"], name: "index_calls_on_project_id"
    t.index ["public_id"], name: "index_calls_on_public_id", unique: true
    t.index ["remote_session_id"], name: "index_calls_on_remote_session_id", unique: true
    t.index ["started_at"], name: "index_calls_on_started_at"
  end

  create_table "comments", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.bigint "organization_membership_id", unsigned: true
    t.string "subject_type", null: false
    t.bigint "subject_id", null: false, unsigned: true
    t.bigint "parent_id", unsigned: true
    t.bigint "attachment_id", unsigned: true
    t.bigint "resolved_by_id", unsigned: true
    t.text "body_html", size: :medium
    t.datetime "resolved_at"
    t.integer "timestamp"
    t.float "x"
    t.float "y"
    t.text "note_highlight"
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "integration_id", unsigned: true
    t.bigint "oauth_application_id", unsigned: true
    t.integer "replies_count", default: 0, null: false
    t.index ["attachment_id"], name: "index_comments_on_attachment_id"
    t.index ["discarded_at"], name: "index_comments_on_discarded_at"
    t.index ["integration_id"], name: "index_comments_on_integration_id"
    t.index ["oauth_application_id"], name: "index_comments_on_oauth_application_id"
    t.index ["organization_membership_id", "discarded_at"], name: "index_comments_on_organization_membership_id_and_discarded_at"
    t.index ["organization_membership_id"], name: "index_comments_on_organization_membership_id"
    t.index ["parent_id"], name: "index_comments_on_parent_id"
    t.index ["public_id"], name: "index_comments_on_public_id", unique: true
    t.index ["resolved_at"], name: "index_comments_on_resolved_at"
    t.index ["resolved_by_id"], name: "index_comments_on_resolved_by_id"
    t.index ["subject_type", "subject_id"], name: "index_comments_on_subject"
  end

  create_table "console1984_commands", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.text "statements"
    t.bigint "sensitive_access_id"
    t.bigint "session_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["sensitive_access_id"], name: "index_console1984_commands_on_sensitive_access_id"
    t.index ["session_id", "created_at", "sensitive_access_id"], name: "on_session_and_sensitive_chronologically"
  end

  create_table "console1984_sensitive_accesses", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.text "justification"
    t.bigint "session_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["session_id"], name: "index_console1984_sensitive_accesses_on_session_id"
  end

  create_table "console1984_sessions", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.text "reason"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_console1984_sessions_on_created_at"
    t.index ["user_id", "created_at"], name: "index_console1984_sessions_on_user_id_and_created_at"
  end

  create_table "console1984_users", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "username", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["username"], name: "index_console1984_users_on_username"
  end

  create_table "custom_reactions", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.string "name", null: false
    t.text "file_path", null: false
    t.string "file_type", null: false
    t.bigint "organization_id", null: false, unsigned: true
    t.bigint "organization_membership_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "pack"
    t.index ["organization_id", "name"], name: "index_custom_reactions_on_organization_id_and_name", unique: true
    t.index ["organization_id"], name: "index_custom_reactions_on_organization_id"
    t.index ["organization_membership_id"], name: "index_custom_reactions_on_organization_membership_id"
    t.index ["public_id"], name: "index_custom_reactions_on_public_id", unique: true
  end

  create_table "data_export_resources", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "data_export_id", null: false, unsigned: true
    t.integer "resource_id"
    t.integer "resource_type", null: false
    t.integer "status", default: 0, null: false
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["data_export_id"], name: "index_data_export_resources_on_data_export_id"
  end

  create_table "data_exports", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.string "subject_type", null: false
    t.bigint "subject_id", null: false, unsigned: true
    t.bigint "member_id", unsigned: true
    t.string "zip_path", limit: 2048
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["member_id"], name: "index_data_exports_on_member_id"
    t.index ["public_id"], name: "index_data_exports_on_public_id", unique: true
    t.index ["subject_type", "subject_id"], name: "index_data_exports_on_subject"
  end

  create_table "email_bounces", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.text "email", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_email_bounces_on_email", unique: true, length: 320
  end

  create_table "events", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "actor_type"
    t.bigint "actor_id", unsigned: true
    t.string "subject_type", null: false
    t.bigint "subject_id", null: false, unsigned: true
    t.bigint "organization_id", null: false, unsigned: true
    t.integer "action", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.json "metadata"
    t.datetime "processed_at"
    t.boolean "skip_notifications", default: false, null: false
    t.index ["actor_type", "actor_id"], name: "index_events_on_actor"
    t.index ["organization_id"], name: "index_events_on_organization_id"
    t.index ["subject_type", "subject_id"], name: "index_events_on_subject"
  end

  create_table "external_records", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "remote_record_id", null: false
    t.string "remote_record_title", null: false
    t.integer "service", null: false
    t.json "metadata"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "parent_id", unsigned: true
    t.index ["parent_id"], name: "index_external_records_on_parent_id"
    t.index ["service", "remote_record_id"], name: "index_external_records_on_service_and_remote_record_id", unique: true
  end

  create_table "favorites", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.string "favoritable_type", null: false
    t.bigint "favoritable_id", null: false, unsigned: true
    t.bigint "organization_membership_id", null: false, unsigned: true
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["favoritable_type", "favoritable_id"], name: "index_favorites_on_favoritable"
    t.index ["organization_membership_id"], name: "index_favorites_on_organization_membership_id"
    t.index ["public_id"], name: "index_favorites_on_public_id", unique: true
  end

  create_table "feedbacks", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.text "description", null: false
    t.integer "feedback_type", null: false, unsigned: true
    t.datetime "posted_to_linear_at"
    t.bigint "user_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "organization_id", unsigned: true
    t.text "current_url"
    t.string "browser_info"
    t.string "os_info"
    t.string "screenshot_path"
    t.datetime "sent_to_plain_at"
    t.index ["organization_id"], name: "index_feedbacks_on_organization_id"
    t.index ["user_id"], name: "index_feedbacks_on_user_id"
  end

  create_table "figma_files", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "remote_file_key", null: false
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["remote_file_key"], name: "index_figma_files_on_remote_file_key", unique: true
  end

  create_table "figma_key_pairs", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "read_key", null: false
    t.string "write_key", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["read_key"], name: "index_figma_key_pairs_on_read_key"
    t.index ["write_key"], name: "index_figma_key_pairs_on_write_key"
  end

  create_table "figma_users", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false, unsigned: true
    t.string "remote_user_id", null: false
    t.string "handle", null: false
    t.string "email", null: false
    t.string "img_url", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_figma_users_on_user_id"
  end

  create_table "flipper_audit_logs", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", unsigned: true
    t.string "operation", null: false
    t.string "feature_name", null: false
    t.boolean "result", null: false
    t.string "gate_name"
    t.json "thing"
    t.json "gate_values_snapshot"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_flipper_audit_logs_on_user_id"
  end

  create_table "flipper_features", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "key", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_flipper_features_on_key", unique: true
  end

  create_table "flipper_gates", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "feature_key", null: false
    t.string "key", null: false
    t.string "value"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["feature_key", "key", "value"], name: "index_flipper_gates_on_feature_key_and_key_and_value", unique: true
  end

  create_table "follow_ups", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.bigint "organization_membership_id", null: false, unsigned: true
    t.string "subject_type", null: false
    t.bigint "subject_id", null: false, unsigned: true
    t.timestamp "show_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "shown_at"
    t.index ["organization_membership_id"], name: "index_follow_ups_on_organization_membership_id"
    t.index ["public_id"], name: "index_follow_ups_on_public_id", unique: true
    t.index ["shown_at"], name: "index_follow_ups_on_shown_at"
    t.index ["subject_type", "subject_id"], name: "index_follow_ups_on_subject"
  end

  create_table "friendly_id_slugs", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "slug", null: false
    t.integer "sluggable_id", null: false
    t.string "sluggable_type", limit: 50
    t.string "scope"
    t.datetime "created_at"
    t.index ["slug", "sluggable_type", "scope"], name: "index_friendly_id_slugs_on_slug_and_sluggable_type_and_scope", unique: true, length: { slug: 70, scope: 70 }
    t.index ["slug", "sluggable_type"], name: "index_friendly_id_slugs_on_slug_and_sluggable_type", length: { slug: 140 }
    t.index ["sluggable_type", "sluggable_id"], name: "index_friendly_id_slugs_on_sluggable_type_and_sluggable_id"
  end

  create_table "github_repositories", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "provider_repository_id", null: false, unsigned: true
    t.string "full_name", null: false
    t.boolean "private", default: false, null: false
    t.bigint "integration_id", null: false, unsigned: true
    t.string "public_id", limit: 12
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name"
    t.index ["integration_id"], name: "index_github_repositories_on_integration_id"
  end

  create_table "integration_channel_members", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "provider_member_id", null: false
    t.bigint "integration_channel_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["integration_channel_id"], name: "index_integration_channel_members_on_integration_channel_id"
    t.index ["provider_member_id", "integration_channel_id"], name: "index_integration_channel_members_on_member_and_channel", unique: true
    t.index ["provider_member_id"], name: "index_integration_channel_members_on_provider_member_id"
  end

  create_table "integration_channels", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "provider_channel_id", null: false
    t.string "name", null: false
    t.boolean "private", default: false, null: false
    t.bigint "integration_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "public_id", limit: 12, null: false
    t.index ["integration_id", "provider_channel_id"], name: "idx_integration_channels_on_integration_and_provider_channel", unique: true
    t.index ["integration_id"], name: "index_integration_channels_on_integration_id"
    t.index ["name"], name: "index_integration_channels_on_name"
    t.index ["provider_channel_id"], name: "index_integration_channels_on_provider_channel_id"
    t.index ["public_id"], name: "index_integration_channels_on_public_id", unique: true
  end

  create_table "integration_data", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name", null: false
    t.string "value", null: false
    t.bigint "integration_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["integration_id"], name: "index_integration_data_on_integration_id"
  end

  create_table "integration_organization_membership_data", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "integration_organization_membership_id", null: false, unsigned: true
    t.string "name", null: false
    t.string "value", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["integration_organization_membership_id"], name: "index_integration_org_member_data_on_integration_org_member"
  end

  create_table "integration_organization_memberships", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "integration_id", null: false, unsigned: true
    t.bigint "organization_membership_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["integration_id", "organization_membership_id"], name: "index_integration_org_members_on_integration_and_member", unique: true
    t.index ["integration_id"], name: "index_integration_organization_memberships_on_integration_id"
    t.index ["organization_membership_id"], name: "index_integration_org_members_on_member"
  end

  create_table "integration_teams", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name", null: false
    t.string "public_id", limit: 12, null: false
    t.string "provider_team_id", null: false
    t.boolean "private", default: false, null: false
    t.bigint "integration_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.json "metadata"
    t.index ["integration_id", "provider_team_id"], name: "index_integration_teams_on_integration_id_and_provider_team_id", unique: true
    t.index ["integration_id"], name: "index_integration_teams_on_integration_id"
    t.index ["name"], name: "index_integration_teams_on_name"
    t.index ["public_id"], name: "index_integration_teams_on_public_id", unique: true
  end

  create_table "integrations", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.string "provider", null: false
    t.string "token", null: false
    t.bigint "creator_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "owner_id", null: false, unsigned: true
    t.string "owner_type", null: false
    t.string "refresh_token"
    t.datetime "token_expires_at"
    t.index ["creator_id"], name: "index_integrations_on_creator_id"
    t.index ["owner_id", "owner_type"], name: "index_integrations_on_owner_id_and_owner_type"
    t.index ["provider"], name: "index_integrations_on_provider"
    t.index ["public_id"], name: "index_integrations_on_public_id", unique: true
  end

  create_table "llm_responses", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "subject_type", null: false
    t.bigint "subject_id", null: false, unsigned: true
    t.string "invocation_key", null: false
    t.text "prompt", size: :medium, null: false
    t.text "response", size: :medium, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "public_id", limit: 12, null: false
    t.index ["invocation_key"], name: "index_llm_responses_on_invocation_key"
    t.index ["public_id"], name: "index_llm_responses_on_public_id", unique: true
    t.index ["subject_type", "subject_id"], name: "index_llm_responses_on_subject"
  end

  create_table "message_notifications", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "message_thread_membership_id", unsigned: true
    t.bigint "message_id", unsigned: true
    t.index ["message_id"], name: "index_message_notifications_on_message_id"
    t.index ["message_thread_membership_id", "message_id"], name: "idx_on_message_thread_membership_id_message_id_658161891d", unique: true
    t.index ["message_thread_membership_id"], name: "index_message_notifications_on_message_thread_membership_id"
  end

  create_table "message_thread_membership_updates", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "message_thread_id", null: false, unsigned: true
    t.bigint "actor_id", null: false, unsigned: true
    t.json "added_organization_membership_ids"
    t.json "removed_organization_membership_ids"
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.json "added_oauth_application_ids"
    t.json "removed_oauth_application_ids"
    t.index ["actor_id"], name: "index_message_thread_membership_updates_on_actor_id"
    t.index ["discarded_at"], name: "index_message_thread_membership_updates_on_discarded_at"
    t.index ["message_thread_id"], name: "index_message_thread_membership_updates_on_message_thread_id"
  end

  create_table "message_thread_memberships", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "message_thread_id", null: false, unsigned: true
    t.bigint "organization_membership_id", unsigned: true
    t.datetime "last_read_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "manually_marked_unread_at"
    t.integer "notification_level", default: 0, null: false
    t.bigint "oauth_application_id", unsigned: true
    t.index ["last_read_at"], name: "index_message_thread_memberships_on_last_read_at"
    t.index ["manually_marked_unread_at"], name: "index_message_thread_memberships_on_manually_marked_unread_at"
    t.index ["message_thread_id", "organization_membership_id"], name: "idx_on_message_thread_id_organization_membership_id_11f8fe3cd8", unique: true
    t.index ["message_thread_id"], name: "index_message_thread_memberships_on_message_thread_id"
    t.index ["oauth_application_id", "message_thread_id"], name: "idx_on_oauth_application_id_message_thread_id_9bbc7f36a2"
    t.index ["oauth_application_id"], name: "index_message_thread_memberships_on_oauth_application_id"
    t.index ["organization_membership_id"], name: "index_message_thread_memberships_on_organization_membership_id"
  end

  create_table "message_threads", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "owner_id", null: false, unsigned: true
    t.string "public_id", limit: 12, null: false
    t.string "title"
    t.datetime "last_message_at"
    t.bigint "latest_message_id", unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "members_count", default: 0, null: false
    t.string "image_path"
    t.boolean "group", default: false, null: false
    t.datetime "discarded_at"
    t.datetime "notification_forced_at"
    t.string "owner_type", default: "OrganizationMembership", null: false
    t.index ["discarded_at"], name: "index_message_threads_on_discarded_at"
    t.index ["last_message_at"], name: "index_message_threads_on_last_message_at"
    t.index ["latest_message_id"], name: "index_message_threads_on_latest_message_id"
    t.index ["owner_id", "owner_type"], name: "index_message_threads_on_owner"
    t.index ["owner_id"], name: "index_message_threads_on_owner_id"
    t.index ["public_id"], name: "index_message_threads_on_public_id", unique: true
  end

  create_table "messages", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "message_thread_id", null: false, unsigned: true
    t.bigint "sender_id", unsigned: true
    t.text "content", null: false
    t.string "public_id", limit: 12, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "reply_to_id"
    t.text "unfurled_link"
    t.datetime "discarded_at"
    t.bigint "call_id", unsigned: true
    t.bigint "integration_id", unsigned: true
    t.bigint "oauth_application_id", unsigned: true
    t.bigint "system_shared_post_id", unsigned: true
    t.index ["call_id", "message_thread_id"], name: "index_messages_on_call_id_and_message_thread_id", unique: true
    t.index ["call_id"], name: "index_messages_on_call_id"
    t.index ["discarded_at"], name: "index_messages_on_discarded_at"
    t.index ["integration_id"], name: "index_messages_on_integration_id"
    t.index ["message_thread_id"], name: "index_messages_on_message_thread_id"
    t.index ["oauth_application_id"], name: "index_messages_on_oauth_application_id"
    t.index ["public_id"], name: "index_messages_on_public_id", unique: true
    t.index ["sender_id"], name: "index_messages_on_sender_id"
    t.index ["system_shared_post_id"], name: "index_messages_on_system_shared_post_id"
  end

  create_table "non_member_note_views", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "note_id", null: false, unsigned: true
    t.bigint "user_id", unsigned: true
    t.string "anonymized_ip", null: false
    t.text "user_agent"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["note_id", "anonymized_ip", "user_agent"], name: "idx_non_member_note_views_on_note_ip_and_user_agent", length: { user_agent: 320 }
    t.index ["note_id", "user_id"], name: "index_non_member_note_views_on_note_id_and_user_id"
    t.index ["note_id"], name: "index_non_member_note_views_on_note_id"
    t.index ["user_id"], name: "index_non_member_note_views_on_user_id"
  end

  create_table "non_member_post_views", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "post_id", null: false, unsigned: true
    t.bigint "user_id", unsigned: true
    t.string "anonymized_ip", null: false
    t.text "user_agent"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id", "anonymized_ip", "user_agent"], name: "idx_non_member_post_views_on_post_ip_and_user_agent", length: { user_agent: 320 }
    t.index ["post_id", "user_id"], name: "index_non_member_post_views_on_post_id_and_user_id"
    t.index ["post_id"], name: "index_non_member_post_views_on_post_id"
    t.index ["user_id"], name: "index_non_member_post_views_on_user_id"
  end

  create_table "note_views", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "note_id", null: false, unsigned: true
    t.bigint "organization_membership_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["note_id", "organization_membership_id"], name: "index_note_views_on_note_id_and_organization_membership_id", unique: true
    t.index ["note_id"], name: "index_note_views_on_note_id"
    t.index ["organization_membership_id"], name: "index_note_views_on_organization_membership_id"
  end

  create_table "notes", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.integer "comments_count", default: 0, null: false, unsigned: true
    t.datetime "discarded_at"
    t.bigint "organization_membership_id", null: false, unsigned: true
    t.text "description_html", size: :medium
    t.text "description_state", size: :medium
    t.integer "description_schema_version", default: 0, null: false
    t.text "title"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "original_project_id", unsigned: true
    t.bigint "original_post_id", unsigned: true
    t.bigint "original_digest_id", unsigned: true
    t.integer "visibility", default: 0, null: false
    t.integer "non_member_views_count", default: 0, null: false
    t.integer "resolved_comments_count", default: 0
    t.bigint "project_id", unsigned: true
    t.datetime "last_activity_at"
    t.datetime "content_updated_at"
    t.integer "project_permission", default: 0, null: false
    t.index ["content_updated_at"], name: "index_notes_on_content_updated_at"
    t.index ["created_at"], name: "index_notes_on_created_at"
    t.index ["discarded_at"], name: "index_notes_on_discarded_at"
    t.index ["last_activity_at"], name: "index_notes_on_last_activity_at"
    t.index ["organization_membership_id"], name: "index_notes_on_organization_membership_id"
    t.index ["project_id"], name: "index_notes_on_project_id"
    t.index ["public_id"], name: "index_notes_on_public_id", unique: true
  end

  create_table "notification_schedules", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false, unsigned: true
    t.time "start_time", null: false
    t.time "end_time", null: false
    t.datetime "last_applied_at"
    t.boolean "monday", default: true, null: false
    t.boolean "tuesday", default: true, null: false
    t.boolean "wednesday", default: true, null: false
    t.boolean "thursday", default: true, null: false
    t.boolean "friday", default: true, null: false
    t.boolean "saturday", default: true, null: false
    t.boolean "sunday", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["end_time"], name: "index_notification_schedules_on_end_time"
    t.index ["friday"], name: "index_notification_schedules_on_friday"
    t.index ["last_applied_at"], name: "index_notification_schedules_on_last_applied_at"
    t.index ["monday"], name: "index_notification_schedules_on_monday"
    t.index ["saturday"], name: "index_notification_schedules_on_saturday"
    t.index ["sunday"], name: "index_notification_schedules_on_sunday"
    t.index ["thursday"], name: "index_notification_schedules_on_thursday"
    t.index ["tuesday"], name: "index_notification_schedules_on_tuesday"
    t.index ["user_id"], name: "index_notification_schedules_on_user_id"
    t.index ["wednesday"], name: "index_notification_schedules_on_wednesday"
  end

  create_table "notifications", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "organization_membership_id", null: false, unsigned: true
    t.bigint "event_id", null: false, unsigned: true
    t.datetime "read_at"
    t.integer "reason", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "discarded_at"
    t.string "target_type", null: false
    t.bigint "target_id", null: false, unsigned: true
    t.string "public_id", limit: 12, null: false
    t.integer "target_scope"
    t.string "slack_message_ts"
    t.datetime "archived_at"
    t.index ["archived_at"], name: "index_notifications_on_archived_at"
    t.index ["discarded_at"], name: "index_notifications_on_discarded_at"
    t.index ["event_id"], name: "index_notifications_on_event_id"
    t.index ["organization_membership_id", "discarded_at", "read_at"], name: "index_notifications_on_member_and_discarded_at_and_read_at"
    t.index ["organization_membership_id", "discarded_at"], name: "idx_notifs_on_org_membership_id_and_discarded_at"
    t.index ["organization_membership_id"], name: "index_notifications_on_organization_membership_id"
    t.index ["public_id"], name: "index_notifications_on_public_id", unique: true
    t.index ["target_id", "target_type", "organization_membership_id", "discarded_at", "created_at"], name: "index_notifications_for_recent_scope"
    t.index ["target_type", "target_id", "organization_membership_id"], name: "index_notifications_on_target_and_member"
    t.index ["target_type", "target_id"], name: "index_notifications_on_target"
  end

  create_table "oauth_access_grants", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "resource_owner_type", null: false
    t.bigint "resource_owner_id", null: false
    t.bigint "application_id", null: false
    t.string "token", null: false
    t.integer "expires_in", null: false
    t.text "redirect_uri", null: false
    t.datetime "created_at", null: false
    t.datetime "revoked_at"
    t.string "scopes", default: "", null: false
    t.string "code_challenge"
    t.string "code_challenge_method"
    t.index ["application_id"], name: "index_oauth_access_grants_on_application_id"
    t.index ["resource_owner_type", "resource_owner_id"], name: "index_oauth_access_grants_on_resource_owner"
  end

  create_table "oauth_access_tokens", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "resource_owner_id"
    t.bigint "application_id", null: false
    t.string "token", null: false
    t.string "refresh_token"
    t.integer "expires_in"
    t.datetime "revoked_at"
    t.datetime "created_at", null: false
    t.string "scopes"
    t.string "previous_refresh_token", default: "", null: false
    t.string "previous_token"
    t.string "resource_owner_type", default: "User", null: false
    t.index ["application_id"], name: "index_oauth_access_tokens_on_application_id"
    t.index ["refresh_token"], name: "index_oauth_access_tokens_on_refresh_token", unique: true
    t.index ["resource_owner_id", "resource_owner_type"], name: "polymorphic_owner_oauth_access_tokens"
    t.index ["resource_owner_id"], name: "index_oauth_access_tokens_on_resource_owner_id"
    t.index ["token"], name: "index_oauth_access_tokens_on_token", unique: true
  end

  create_table "oauth_applications", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.string "name", null: false
    t.string "uid", null: false
    t.string "secret", null: false
    t.text "redirect_uri"
    t.string "scopes", default: "", null: false
    t.boolean "confidential", default: true, null: false
    t.string "owner_type"
    t.bigint "owner_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "avatar_path"
    t.datetime "discarded_at"
    t.integer "provider"
    t.bigint "creator_id", unsigned: true
    t.datetime "last_copied_secret_at"
    t.index ["creator_id"], name: "index_oauth_applications_on_creator_id"
    t.index ["discarded_at"], name: "index_oauth_applications_on_discarded_at"
    t.index ["owner_type", "owner_id"], name: "index_oauth_applications_on_owner"
    t.index ["public_id"], name: "index_oauth_applications_on_public_id", unique: true
    t.index ["uid"], name: "index_oauth_applications_on_uid", unique: true
  end

  create_table "open_graph_links", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.text "url", null: false
    t.text "title", null: false
    t.text "image_path"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "favicon_path"
  end

  create_table "organization_invitation_projects", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "project_id", null: false, unsigned: true
    t.bigint "organization_invitation_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["organization_invitation_id"], name: "idx_on_organization_invitation_id_c29fc54ff5"
    t.index ["project_id"], name: "index_organization_invitation_projects_on_project_id"
  end

  create_table "organization_invitations", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.text "email", null: false
    t.bigint "organization_id", null: false, unsigned: true
    t.bigint "sender_id", null: false, unsigned: true
    t.bigint "recipient_id", unsigned: true
    t.string "role", null: false
    t.string "invite_token", null: false
    t.datetime "expires_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["expires_at"], name: "index_organization_invitations_on_expires_at"
    t.index ["invite_token"], name: "index_organization_invitations_on_invite_token", unique: true
    t.index ["organization_id", "email"], name: "index_organization_invitations_on_organization_id_and_email", unique: true, length: { email: 320 }
    t.index ["organization_id", "recipient_id"], name: "idx_org_invitations_on_org_id_and_recipient_id", unique: true
    t.index ["public_id"], name: "index_organization_invitations_on_public_id", unique: true
    t.index ["role"], name: "index_organization_invitations_on_role"
    t.index ["sender_id"], name: "index_organization_invitations_on_sender_id"
  end

  create_table "organization_membership_requests", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.bigint "user_id", null: false
    t.bigint "organization_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["organization_id", "user_id"], name: "idx_org_memberhip_requests_on_org_id_and_user_id", unique: true
    t.index ["organization_id"], name: "index_organization_membership_requests_on_organization_id"
    t.index ["public_id"], name: "index_organization_membership_requests_on_public_id", unique: true
    t.index ["user_id"], name: "index_organization_membership_requests_on_user_id"
  end

  create_table "organization_membership_statuses", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "message", null: false
    t.string "emoji", null: false
    t.datetime "expires_at"
    t.bigint "organization_membership_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "expiration_setting", default: "custom", null: false
    t.boolean "pause_notifications", default: false, null: false
    t.index ["expires_at"], name: "index_organization_membership_statuses_on_expires_at"
    t.index ["organization_membership_id", "message"], name: "idx_on_organization_membership_id_message_21aa1d6391"
    t.index ["organization_membership_id"], name: "idx_on_organization_membership_id_16e938dd29"
  end

  create_table "organization_memberships", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.bigint "organization_id", null: false, unsigned: true
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "discarded_at"
    t.datetime "last_seen_at"
    t.string "role_name", default: "viewer", null: false
    t.bigint "latest_status_id"
    t.integer "position"
    t.datetime "last_viewed_posts_at"
    t.datetime "home_last_seen_at"
    t.datetime "activity_last_seen_at"
    t.index ["activity_last_seen_at"], name: "index_organization_memberships_on_activity_last_seen_at"
    t.index ["discarded_at", "last_seen_at", "organization_id"], name: "idx_memberships_on_discarded_last_seen_and_org"
    t.index ["discarded_at"], name: "index_organization_memberships_on_discarded_at"
    t.index ["home_last_seen_at"], name: "index_organization_memberships_on_home_last_seen_at"
    t.index ["organization_id", "user_id"], name: "index_organization_memberships_on_organization_id_and_user_id", unique: true
    t.index ["organization_id"], name: "index_organization_memberships_on_organization_id"
    t.index ["public_id"], name: "index_organization_memberships_on_public_id", unique: true
    t.index ["role_name"], name: "index_organization_memberships_on_role_name"
    t.index ["user_id"], name: "index_organization_memberships_on_user_id"
  end

  create_table "organization_settings", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "key", null: false
    t.string "value", null: false
    t.bigint "organization_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["organization_id", "key"], name: "index_organization_settings_on_organization_id_and_key", unique: true
    t.index ["organization_id"], name: "index_organization_settings_on_organization_id"
  end

  create_table "organizations", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.string "name", null: false
    t.string "slug", null: false
    t.string "email_domain"
    t.text "billing_email"
    t.string "avatar_path"
    t.string "slack_channel_id"
    t.string "invite_token", null: false
    t.bigint "creator_id", unsigned: true
    t.datetime "onboarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "plan_name", default: "pro", null: false
    t.integer "member_count", default: 0, null: false
    t.boolean "demo", default: false
    t.string "creator_role"
    t.string "creator_org_size"
    t.datetime "trial_ends_at"
    t.string "creator_source"
    t.text "creator_why"
    t.index ["email_domain"], name: "index_organizations_on_email_domain"
    t.index ["invite_token"], name: "index_organizations_on_invite_token", unique: true
    t.index ["public_id"], name: "index_organizations_on_public_id", unique: true
    t.index ["slug"], name: "index_organizations_on_slug", unique: true
  end

  create_table "permissions", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false, unsigned: true
    t.string "subject_type", null: false
    t.bigint "subject_id", null: false, unsigned: true
    t.integer "action", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "discarded_at"
    t.string "public_id", limit: 12, null: false
    t.index ["discarded_at"], name: "index_permissions_on_discarded_at"
    t.index ["public_id"], name: "index_permissions_on_public_id", unique: true
    t.index ["subject_type", "subject_id"], name: "index_permissions_on_subject"
    t.index ["user_id", "subject_id", "subject_type", "action", "discarded_at"], name: "index_permissions_on_user_subject_action_and_discarded_at", unique: true
    t.index ["user_id"], name: "index_permissions_on_user_id"
  end

  create_table "poll_options", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.string "description", null: false
    t.integer "votes_count", default: 0
    t.bigint "poll_id", null: false, unsigned: true
    t.index ["poll_id"], name: "index_poll_options_on_poll_id"
    t.index ["public_id"], name: "index_poll_options_on_public_id", unique: true
  end

  create_table "poll_votes", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "poll_option_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "organization_membership_id", unsigned: true
    t.index ["organization_membership_id"], name: "index_poll_votes_on_organization_membership_id"
    t.index ["poll_option_id"], name: "index_poll_votes_on_poll_option_id"
  end

  create_table "polls", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.string "description", null: false
    t.integer "votes_count", default: 0
    t.bigint "post_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id"], name: "index_polls_on_post_id"
    t.index ["public_id"], name: "index_polls_on_public_id", unique: true
  end

  create_table "post_digest_basic_posts", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "post_id", null: false, unsigned: true
    t.bigint "post_digest_id", null: false, unsigned: true
    t.integer "position", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["position"], name: "index_post_digest_basic_posts_on_position"
    t.index ["post_digest_id"], name: "index_post_digest_basic_posts_on_post_digest_id"
    t.index ["post_id"], name: "index_post_digest_basic_posts_on_post_id"
  end

  create_table "post_digest_notes", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.text "title", null: false
    t.text "content"
    t.bigint "organization_membership_id", null: false, unsigned: true
    t.bigint "post_id", null: false, unsigned: true
    t.bigint "post_digest_id", null: false, unsigned: true
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "content_html"
    t.index ["organization_membership_id"], name: "index_post_digest_notes_on_organization_membership_id"
    t.index ["post_digest_id"], name: "index_post_digest_notes_on_post_digest_id"
    t.index ["post_id", "post_digest_id"], name: "index_post_digest_notes_on_post_id_and_post_digest_id"
    t.index ["post_id"], name: "index_post_digest_notes_on_post_id"
    t.index ["public_id"], name: "index_post_digest_notes_on_public_id", unique: true
  end

  create_table "post_digests", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.bigint "organization_id", null: false, unsigned: true
    t.bigint "creator_id", null: false, unsigned: true
    t.text "title", null: false
    t.text "description"
    t.datetime "published_at"
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "filter_tag_ids"
    t.text "filter_project_ids"
    t.text "filter_member_ids"
    t.text "exclude_post_ids"
    t.string "filter_from"
    t.string "filter_to"
    t.boolean "basic", default: false, null: false
    t.index ["creator_id"], name: "index_post_digests_on_creator_id"
    t.index ["organization_id"], name: "index_post_digests_on_organization_id"
    t.index ["public_id"], name: "index_post_digests_on_public_id", unique: true
  end

  create_table "post_feedback_requests", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.boolean "has_replied", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "organization_membership_id"
    t.bigint "post_id"
    t.datetime "discarded_at"
    t.datetime "dismissed_at"
    t.index ["discarded_at"], name: "index_post_feedback_requests_on_discarded_at"
    t.index ["dismissed_at"], name: "index_post_feedback_requests_on_dismissed_at"
    t.index ["organization_membership_id"], name: "index_post_feedback_requests_on_organization_membership_id"
    t.index ["post_id"], name: "index_post_feedback_requests_on_post_id"
    t.index ["public_id"], name: "index_post_feedback_requests_on_public_id", unique: true
  end

  create_table "post_hierarchies", id: false, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.integer "ancestor_id", null: false
    t.integer "descendant_id", null: false
    t.integer "generations", null: false
    t.index ["ancestor_id", "descendant_id", "generations"], name: "post_anc_desc_idx", unique: true
    t.index ["descendant_id"], name: "post_desc_idx"
  end

  create_table "post_link_previews", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.text "url", null: false
    t.string "title", null: false
    t.string "description"
    t.string "image_url"
    t.string "video_url"
    t.string "service_logo"
    t.string "service_name", null: false
    t.boolean "preview", default: false
    t.bigint "post_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id"], name: "index_post_link_previews_on_post_id"
    t.index ["public_id"], name: "index_post_link_previews_on_public_id", unique: true
  end

  create_table "post_links", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.text "url", null: false
    t.string "name", null: false
    t.bigint "post_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id"], name: "index_post_links_on_post_id"
    t.index ["public_id"], name: "index_post_links_on_public_id", unique: true
  end

  create_table "post_taggings", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "tag_id"
    t.bigint "post_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id", "tag_id"], name: "index_post_taggings_on_post_id_and_tag_id", unique: true
    t.index ["post_id"], name: "index_post_taggings_on_post_id"
    t.index ["tag_id"], name: "index_post_taggings_on_tag_id"
  end

  create_table "post_views", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.bigint "post_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "organization_membership_id", unsigned: true
    t.datetime "read_at"
    t.integer "dwell_time_total", default: 0, null: false
    t.integer "reads_count", default: 0, null: false
    t.index ["organization_membership_id"], name: "index_post_views_on_organization_membership_id"
    t.index ["post_id", "organization_membership_id"], name: "index_post_views_on_post_id_and_organization_membership_id", unique: true
    t.index ["post_id"], name: "index_post_views_on_post_id"
    t.index ["public_id"], name: "index_post_views_on_public_id", unique: true
    t.index ["read_at"], name: "index_post_views_on_read_at"
  end

  create_table "posts", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.string "slack_message_ts"
    t.bigint "organization_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "project_id", null: false, unsigned: true
    t.integer "comments_count", default: 0, null: false
    t.bigint "parent_id", unsigned: true
    t.integer "version", default: 1
    t.datetime "discarded_at"
    t.bigint "organization_membership_id", unsigned: true
    t.text "title"
    t.bigint "previous_parent_id", unsigned: true
    t.integer "views_count", default: 0, null: false
    t.boolean "stale", default: false, null: false
    t.bigint "child_id", unsigned: true
    t.bigint "root_id", unsigned: true
    t.bigint "post_parent_id", unsigned: true
    t.integer "status", default: 0, null: false
    t.integer "visibility", default: 0, null: false
    t.integer "non_member_views_count", default: 0, null: false
    t.datetime "bias_reduced_at"
    t.text "description_html", size: :medium
    t.datetime "published_at"
    t.text "unfurled_link"
    t.integer "resolved_comments_count", default: 0
    t.bigint "integration_id", unsigned: true
    t.bigint "oauth_application_id", unsigned: true
    t.bigint "from_message_id", unsigned: true
    t.datetime "last_activity_at", null: false
    t.datetime "resolved_at"
    t.bigint "resolved_by_id", unsigned: true
    t.text "resolved_html", size: :medium
    t.bigint "resolved_comment_id", unsigned: true
    t.string "workflow_state", default: "published", null: false
    t.string "resolved_by_type", default: "OrganizationMembership"
    t.index ["child_id"], name: "index_posts_on_child_id"
    t.index ["discarded_at"], name: "index_posts_on_discarded_at"
    t.index ["from_message_id"], name: "index_posts_on_from_message_id"
    t.index ["integration_id"], name: "index_posts_on_integration_id"
    t.index ["last_activity_at"], name: "index_posts_on_last_activity_at"
    t.index ["oauth_application_id"], name: "index_posts_on_oauth_application_id"
    t.index ["organization_id", "discarded_at"], name: "index_posts_on_organization_id_and_discarded_at"
    t.index ["organization_id"], name: "index_posts_on_organization_id"
    t.index ["organization_membership_id"], name: "index_posts_on_organization_membership_id"
    t.index ["parent_id"], name: "index_posts_on_parent_id"
    t.index ["post_parent_id"], name: "index_posts_on_post_parent_id"
    t.index ["project_id", "discarded_at"], name: "index_posts_on_project_id_and_discarded_at"
    t.index ["project_id"], name: "index_posts_on_project_id"
    t.index ["public_id"], name: "index_posts_on_public_id", unique: true
    t.index ["published_at"], name: "index_posts_on_published_at"
    t.index ["resolved_at"], name: "index_posts_on_resolved_at"
    t.index ["resolved_by_id", "resolved_by_type"], name: "index_posts_on_resolved_by_id_and_resolved_by_type"
    t.index ["resolved_comment_id"], name: "index_posts_on_resolved_comment_id"
    t.index ["root_id"], name: "index_posts_on_root_id"
    t.index ["status"], name: "index_posts_on_status"
    t.index ["workflow_state"], name: "index_posts_on_workflow_state"
  end

  create_table "preferences", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "subject_id", null: false, unsigned: true
    t.string "subject_type", null: false
    t.string "key", null: false
    t.string "value", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_preferences_on_key"
    t.index ["subject_id", "subject_type", "key"], name: "index_preferences_on_subject_id_and_subject_type_and_key", unique: true
    t.index ["subject_id", "subject_type"], name: "index_preferences_on_subject_id_and_subject_type"
  end

  create_table "product_logs", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "subject_type"
    t.bigint "subject_id", unsigned: true
    t.datetime "log_ts", null: false
    t.string "name", null: false
    t.json "data"
    t.string "session_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.json "device_info"
    t.virtual "device_info_browser_name", type: :string, as: "json_unquote(json_extract(`device_info`,_utf8mb4'$.browser_name'))", stored: true
    t.virtual "device_info_browser_version", type: :string, as: "json_unquote(json_extract(`device_info`,_utf8mb4'$.browser_version'))", stored: true
    t.virtual "device_info_os_name", type: :string, as: "json_unquote(json_extract(`device_info`,_utf8mb4'$.os_name'))", stored: true
    t.virtual "device_info_os_version", type: :string, as: "json_unquote(json_extract(`device_info`,_utf8mb4'$.os_version'))", stored: true
    t.virtual "device_info_device_name", type: :string, as: "json_unquote(json_extract(`device_info`,_utf8mb4'$.device_name'))", stored: true
    t.virtual "device_info_device_type", type: :string, as: "json_unquote(json_extract(`device_info`,_utf8mb4'$.device_type'))", stored: true
    t.virtual "device_info_device_brand", type: :string, as: "json_unquote(json_extract(`device_info`,_utf8mb4'$.device_brand'))", stored: true
    t.virtual "device_info_is_desktop_app", type: :string, as: "json_unquote(json_extract(`device_info`,_utf8mb4'$.is_desktop_app'))", stored: true
    t.virtual "device_info_is_pwa", type: :string, as: "json_unquote(json_extract(`device_info`,_utf8mb4'$.is_pwa'))", stored: true
    t.virtual "device_info_desktop_app_version", type: :string, as: "json_unquote(json_extract(`device_info`,_utf8mb4'$.desktop_app_version'))", stored: true
    t.index ["device_info_browser_name"], name: "index_product_logs_on_device_info_browser_name"
    t.index ["device_info_browser_version"], name: "index_product_logs_on_device_info_browser_version"
    t.index ["device_info_desktop_app_version"], name: "index_product_logs_on_device_info_desktop_app_version"
    t.index ["device_info_device_brand"], name: "index_product_logs_on_device_info_device_brand"
    t.index ["device_info_device_name"], name: "index_product_logs_on_device_info_device_name"
    t.index ["device_info_device_type"], name: "index_product_logs_on_device_info_device_type"
    t.index ["device_info_is_desktop_app"], name: "index_product_logs_on_device_info_is_desktop_app"
    t.index ["device_info_is_pwa"], name: "index_product_logs_on_device_info_is_pwa"
    t.index ["device_info_os_name"], name: "index_product_logs_on_device_info_os_name"
    t.index ["device_info_os_version"], name: "index_product_logs_on_device_info_os_version"
    t.index ["name"], name: "index_product_logs_on_name"
    t.index ["session_id"], name: "index_product_logs_on_session_id"
    t.index ["subject_id", "subject_type", "log_ts", "name"], name: "idx_on_subject_id_subject_type_log_ts_name_c9603f336b"
    t.index ["subject_id", "subject_type", "log_ts"], name: "index_product_logs_on_subject_id_and_subject_type_and_log_ts"
    t.index ["subject_type", "log_ts", "name"], name: "index_product_logs_on_subject_type_and_log_ts_and_name"
    t.index ["subject_type", "subject_id", "name"], name: "index_product_logs_on_subject_type_and_subject_id_and_name"
    t.index ["subject_type", "subject_id"], name: "index_product_logs_on_subject"
  end

  create_table "project_display_preferences", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "project_id", null: false, unsigned: true
    t.bigint "organization_membership_id", null: false, unsigned: true
    t.boolean "display_reactions", default: true, null: false
    t.boolean "display_attachments", default: true, null: false
    t.boolean "display_comments", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "display_resolved", default: true, null: false
    t.index ["organization_membership_id"], name: "idx_on_organization_membership_id_fe056b1738"
    t.index ["project_id", "organization_membership_id"], name: "idx_on_project_id_organization_membership_id_846b339d9c", unique: true
    t.index ["project_id"], name: "index_project_display_preferences_on_project_id"
  end

  create_table "project_memberships", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.integer "position"
    t.bigint "project_id", null: false, unsigned: true
    t.bigint "organization_membership_id", unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "discarded_at"
    t.bigint "oauth_application_id", unsigned: true
    t.index ["discarded_at"], name: "index_project_memberships_on_discarded_at"
    t.index ["oauth_application_id", "project_id", "discarded_at"], name: "idx_on_oauth_application_id_project_id_discarded_at_bf4783cf38"
    t.index ["oauth_application_id"], name: "index_project_memberships_on_oauth_application_id"
    t.index ["organization_membership_id", "project_id", "discarded_at"], name: "idx_on_organization_membership_id_project_id_discar_31b8958731"
    t.index ["organization_membership_id"], name: "index_project_memberships_on_organization_membership_id"
    t.index ["project_id"], name: "index_project_memberships_on_project_id"
    t.index ["public_id"], name: "index_project_memberships_on_public_id", unique: true
  end

  create_table "project_pins", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "project_id", null: false, unsigned: true
    t.bigint "organization_membership_id", null: false, unsigned: true
    t.string "subject_type", null: false
    t.bigint "subject_id", null: false, unsigned: true
    t.string "public_id", limit: 12, null: false
    t.integer "position", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "discarded_at"
    t.index ["discarded_at"], name: "index_project_pins_on_discarded_at"
    t.index ["organization_membership_id"], name: "index_project_pins_on_organization_membership_id"
    t.index ["project_id", "subject_id", "subject_type"], name: "idx_on_project_id_subject_id_subject_type_05c30a5f6a", unique: true
    t.index ["project_id"], name: "index_project_pins_on_project_id"
    t.index ["public_id"], name: "index_project_pins_on_public_id", unique: true
    t.index ["subject_type", "subject_id"], name: "index_project_pins_on_subject"
  end

  create_table "project_views", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "organization_membership_id", null: false, unsigned: true
    t.bigint "project_id", null: false, unsigned: true
    t.timestamp "last_viewed_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "manually_marked_unread_at"
    t.index ["manually_marked_unread_at"], name: "index_project_views_on_manually_marked_unread_at"
    t.index ["organization_membership_id", "project_id"], name: "idx_on_organization_membership_id_project_id_03ec29295c", unique: true
    t.index ["organization_membership_id"], name: "index_project_views_on_organization_membership_id"
    t.index ["project_id"], name: "index_project_views_on_project_id"
  end

  create_table "projects", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.string "name", null: false
    t.text "description"
    t.string "slack_channel_id"
    t.bigint "creator_id", null: false, unsigned: true
    t.bigint "organization_id", null: false, unsigned: true
    t.datetime "archived_at"
    t.bigint "archived_by_id", unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "posts_count", default: 0, null: false
    t.string "cover_photo_path"
    t.string "accessory"
    t.boolean "private", default: false, null: false
    t.boolean "is_default"
    t.boolean "is_general", default: false
    t.integer "contributors_count", default: 0, null: false
    t.integer "members_count", default: 0, null: false
    t.datetime "last_activity_at", null: false
    t.boolean "personal", default: false
    t.string "invite_token", null: false
    t.integer "guests_count", default: 0, null: false
    t.bigint "message_thread_id", unsigned: true
    t.boolean "display_reactions", default: true, null: false
    t.boolean "display_attachments", default: true, null: false
    t.boolean "display_comments", default: true, null: false
    t.boolean "display_resolved", default: true, null: false
    t.index ["archived_at"], name: "index_projects_on_archived_at"
    t.index ["creator_id", "organization_id", "personal"], name: "index_projects_on_creator_id_and_organization_id_and_personal"
    t.index ["invite_token"], name: "index_projects_on_invite_token", unique: true
    t.index ["is_default"], name: "index_projects_on_is_default"
    t.index ["is_general"], name: "index_projects_on_is_general"
    t.index ["last_activity_at"], name: "index_projects_on_last_activity_at"
    t.index ["message_thread_id"], name: "index_projects_on_message_thread_id"
    t.index ["organization_id", "archived_at"], name: "index_projects_on_organization_id_and_archived_at"
    t.index ["organization_id"], name: "index_projects_on_organization_id"
    t.index ["private"], name: "index_projects_on_private"
    t.index ["public_id"], name: "index_projects_on_public_id", unique: true
  end

  create_table "reactions", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.string "content"
    t.bigint "subject_id", null: false, unsigned: true
    t.string "subject_type", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "organization_membership_id", unsigned: true
    t.datetime "discarded_at"
    t.bigint "custom_reaction_id", unsigned: true
    t.index ["custom_reaction_id"], name: "index_reactions_on_custom_reaction_id"
    t.index ["discarded_at"], name: "index_reactions_on_discarded_at"
    t.index ["organization_membership_id"], name: "index_reactions_on_organization_membership_id"
    t.index ["subject_id", "subject_type", "organization_membership_id", "content", "discarded_at"], name: "idx_reactions_on_subject_id_type_and_member_id_and_content", unique: true
    t.index ["subject_id", "subject_type"], name: "index_reactions_on_subject_id_and_subject_type"
  end

  create_table "scheduled_notifications", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.string "name", null: false
    t.time "delivery_time", null: false
    t.integer "delivery_day"
    t.string "time_zone", null: false
    t.string "schedulable_type", null: false
    t.bigint "schedulable_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "delivery_offset"
    t.index ["public_id"], name: "index_scheduled_notifications_on_public_id", unique: true
    t.index ["schedulable_type", "schedulable_id", "name"], name: "idx_scheduled_notifications_on_schedulable_type_and_id_and_name"
    t.index ["schedulable_type", "schedulable_id"], name: "index_scheduled_notifications_on_schedulable"
    t.index ["time_zone", "delivery_time", "delivery_day"], name: "idx_scheduled_notifications_on_day_and_time_and_time_zone"
  end

  create_table "tags", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.string "name", limit: 32, null: false
    t.bigint "organization_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "posts_count", default: 0, null: false
    t.index ["name"], name: "index_tags_on_name"
    t.index ["organization_id", "name"], name: "index_tags_on_organization_id_and_name", unique: true
    t.index ["organization_id"], name: "index_tags_on_organization_id"
    t.index ["public_id"], name: "index_tags_on_public_id", unique: true
  end

  create_table "timeline_events", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "actor_type"
    t.bigint "actor_id", unsigned: true
    t.string "subject_type", null: false
    t.bigint "subject_id", null: false, unsigned: true
    t.string "reference_type"
    t.bigint "reference_id", unsigned: true
    t.integer "action", null: false
    t.json "metadata"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "public_id", limit: 12, null: false
    t.index ["action"], name: "index_timeline_events_on_action"
    t.index ["actor_type", "actor_id"], name: "index_timeline_events_on_actor"
    t.index ["public_id"], name: "index_timeline_events_on_public_id", unique: true
    t.index ["reference_type", "reference_id"], name: "index_timeline_events_on_reference"
    t.index ["subject_type", "subject_id"], name: "index_timeline_events_on_subject"
  end

  create_table "user_preferences", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "key", null: false
    t.string "value", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_user_preferences_on_key"
    t.index ["user_id"], name: "index_user_preferences_on_user_id"
  end

  create_table "user_subscriptions", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.string "subscribable_type", null: false
    t.bigint "subscribable_id", null: false, unsigned: true
    t.bigint "user_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "cascade", default: false, null: false
    t.index ["public_id"], name: "index_user_subscriptions_on_public_id", unique: true
    t.index ["subscribable_type", "subscribable_id", "user_id"], name: "idx_user_subscriptions_on_subscribable_type_id_and_user_id", unique: true
    t.index ["subscribable_type", "subscribable_id"], name: "index_user_subscriptions_on_subscribable"
    t.index ["user_id"], name: "index_user_subscriptions_on_user_id"
  end

  create_table "users", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "username"
    t.string "name"
    t.string "public_id", limit: 12, null: false
    t.string "avatar_path"
    t.text "email", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.text "unconfirmed_email"
    t.string "omniauth_provider"
    t.string "omniauth_uid"
    t.datetime "onboarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "cover_photo_path"
    t.string "login_token"
    t.datetime "login_token_expires_at"
    t.integer "consumed_timestep"
    t.json "otp_backup_codes"
    t.boolean "otp_enabled"
    t.string "otp_secret"
    t.datetime "last_seen_at"
    t.string "login_token_sso_id"
    t.datetime "scheduled_email_notifications_from"
    t.boolean "demo", default: false
    t.boolean "staff", default: false, null: false
    t.string "referrer", limit: 2048
    t.string "landing_url", limit: 2048
    t.datetime "notification_pause_expires_at"
    t.string "preferred_timezone"
    t.datetime "notifications_paused_at"
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true, length: 320
    t.index ["login_token"], name: "index_users_on_login_token", unique: true
    t.index ["omniauth_provider", "omniauth_uid"], name: "index_users_on_omniauth_provider_and_omniauth_uid", unique: true
    t.index ["public_id"], name: "index_users_on_public_id", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  create_table "web_push_subscriptions", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false, unsigned: true
    t.text "endpoint", null: false
    t.string "p256dh", null: false
    t.string "auth", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_web_push_subscriptions_on_user_id"
  end

  create_table "webhook_deliveries", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.integer "status_code"
    t.datetime "delivered_at"
    t.bigint "webhook_event_id", null: false, unsigned: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "signature"
    t.index ["public_id"], name: "index_webhook_deliveries_on_public_id", unique: true
    t.index ["webhook_event_id"], name: "index_webhook_deliveries_on_webhook_event_id"
  end

  create_table "webhook_events", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.string "event_type", null: false
    t.json "payload", null: false
    t.integer "status", default: 0, null: false
    t.bigint "webhook_id", null: false, unsigned: true
    t.integer "deliveries_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "subject_type", null: false
    t.bigint "subject_id", null: false, unsigned: true
    t.index ["event_type", "webhook_id"], name: "index_webhook_events_on_event_type_and_webhook_id"
    t.index ["public_id"], name: "index_webhook_events_on_public_id", unique: true
    t.index ["status", "webhook_id"], name: "index_webhook_events_on_status_and_webhook_id"
    t.index ["subject_type", "subject_id"], name: "index_webhook_events_on_subject"
    t.index ["webhook_id"], name: "index_webhook_events_on_webhook_id"
  end

  create_table "webhooks", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "public_id", limit: 12, null: false
    t.string "url", null: false
    t.integer "state", default: 0, null: false
    t.datetime "discarded_at"
    t.string "owner_type", null: false
    t.bigint "owner_id", null: false, unsigned: true
    t.bigint "creator_id", null: false, unsigned: true
    t.string "secret", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.json "event_types", null: false
    t.index ["owner_type", "owner_id"], name: "index_webhooks_on_owner"
    t.index ["public_id"], name: "index_webhooks_on_public_id", unique: true
  end
end
