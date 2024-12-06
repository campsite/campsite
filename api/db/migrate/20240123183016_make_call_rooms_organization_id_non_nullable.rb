class MakeCallRoomsOrganizationIdNonNullable < ActiveRecord::Migration[7.1]
  def up
    if Rails.env.development?
      CallRoom.where(organization_id: nil).preload(subject: :owner).find_each do |room|
        room.update_columns(organization_id: room.subject.owner.organization_id)
      end
    end

    change_column :call_rooms, :organization_id, :bigint, unsigned: true, null: false
  end

  def down
    change_column :call_rooms, :organization_id, :bigint, unsigned: true, null: true
  end
end
