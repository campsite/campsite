class AddNameToGithubRepositories < ActiveRecord::Migration[7.0]
  def change
    add_column :github_repositories, :name, :string
  end
end
