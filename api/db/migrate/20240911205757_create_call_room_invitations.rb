class CreateCallRoomInvitations < ActiveRecord::Migration[7.2]
  def change
    create_table :call_room_invitations do |t|
      t.references :call_room, unsigned: true, null: false, index: true
      t.references :creator_organization_membership, unsigned: true, null: false, index: true
      t.json :invitee_organization_membership_ids, null: false
      t.datetime :discarded_at
      t.timestamps
    end
  end
end
