class MakeAttachmentSubjectOptional < ActiveRecord::Migration[7.1]
  def change
    change_column :attachments, :subject_id, :bigint, null: true, unsigned: true
    change_column :attachments, :subject_type, :string, null: true
  end
end
