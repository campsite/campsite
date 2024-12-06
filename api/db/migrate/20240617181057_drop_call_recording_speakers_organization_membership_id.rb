class DropCallRecordingSpeakersOrganizationMembershipId < ActiveRecord::Migration[7.1]
  def change
    remove_index :call_recording_speakers, [:call_recording_id, :organization_membership_id], unique: true, name: :idx_on_call_recording_id_organization_membership_id_b526e97830
    remove_column :call_recording_speakers, :organization_membership_id, :bigint, unsigned: true
  end
end
