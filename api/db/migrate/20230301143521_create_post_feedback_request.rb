# frozen_string_literal: true

class CreatePostFeedbackRequest < ActiveRecord::Migration[7.0]
  def change
    create_table(:post_feedback_requests, id: { type: :bigint, unsigned: true }) do |t|
      t.string(:public_id, limit: 12, null: false, index: { unique: true })
      t.boolean(:has_replied, null: false, default: false)

      t.timestamps
    end

    add_reference(:post_feedback_requests, :organization_membership)
    add_reference(:post_feedback_requests, :post)
  end
end
