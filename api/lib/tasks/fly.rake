# frozen_string_literal: true

namespace :fly do
  task ssh: [:environment] do
    sh "fly ssh console"
  end

  task console: [:environment] do
    sh 'fly ssh console -C "bin/rails console" --pty'
  end

  task dbconsole: [:environment] do
    sh 'fly ssh console -C "bin/rails dbconsole" --pty'
  end
end
