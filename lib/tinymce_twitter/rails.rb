module TinymceTwitter

  class Engine < ::Rails::Engine

    initializer 'TinymceTwitter.assets_pipeline' do |app|
      app.config.assets.precompile << "tinymce/plugins/twitter/*"
    end

  end # Engine

end # TinymceTwitter
