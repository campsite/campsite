class DropIntegrationIssues < ActiveRecord::Migration[7.0]
  def change
    drop_table :integration_issues do |t|
      t.string "subject_type", null: false
      t.bigint "subject_id", null: false, unsigned: true
      t.string "service", null: false
      t.bigint "organization_membership_id", null: false, unsigned: true
      t.json "data"
      t.datetime "created_at", null: false
      t.datetime "updated_at", null: false
      t.datetime "posted_to_service_at"
      t.json "metadata"
      t.bigint "post_id", unsigned: true
      t.string "public_id", limit: 12, null: false
      t.datetime "discarded_at"
      t.string "remote_record_id"
      t.bigint "integration_id", unsigned: true
      t.index ["post_id"], name: "index_integration_issues_on_post_id"
      t.index ["public_id"], name: "index_integration_issues_on_public_id", unique: true
      t.index ["subject_type", "subject_id"], name: "index_integration_issues_on_subject"
    end
  end
end
