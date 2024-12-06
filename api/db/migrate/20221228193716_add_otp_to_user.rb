class AddOtpToUser < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :consumed_timestep, :integer
    add_column :users, :otp_backup_codes, :json
    add_column :users, :otp_enabled, :boolean
    add_column :users, :otp_secret, :string
  end
end
