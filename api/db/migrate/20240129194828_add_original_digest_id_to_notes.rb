class AddOriginalDigestIdToNotes < ActiveRecord::Migration[7.1]
  def change
    add_column :notes, :original_digest_id, :bigint, unsigned: true, null: true
  end
end
