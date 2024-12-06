class AddSpaceReferenceToNotes < ActiveRecord::Migration[7.1]
  def change
    add_reference :notes, :project, type: :bigint, null: true, unsigned: true
  end
end
