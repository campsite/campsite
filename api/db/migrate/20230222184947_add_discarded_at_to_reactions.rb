class AddDiscardedAtToReactions < ActiveRecord::Migration[7.0]
  def change
    add_column :reactions, :discarded_at, :datetime
    add_index :reactions, :discarded_at

    remove_index :reactions, ["subject_id", "subject_type", "organization_membership_id", "content"], name: "idx_reactions_on_subject_id_type_and_member_id_and_content", unique: true
    remove_index :reactions, ["subject_id", "subject_type", "user_id", "content"], name: "idx_reactions_on_subject_id_type_and_user_id_and_content", unique: true
    
    add_index :reactions, ["subject_id", "subject_type", "organization_membership_id", "content", "discarded_at"], name: "idx_reactions_on_subject_id_type_and_member_id_and_content", unique: true
    add_index :reactions, ["subject_id", "subject_type", "user_id", "content", "discarded_at"], name: "idx_reactions_on_subject_id_type_and_user_id_and_content", unique: true
  end
end
