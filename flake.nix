{
  description = "Mktute";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    packageJSONText = {
      url = "path:package.json";
      flake = false;
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      packageJSONText,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
        nodejs = pkgs.nodejs_18;
        packageJSON = pkgs.lib.importJSON packageJSONText;
      in
      {
        packages = rec {
          default = pkgs.writeShellScriptBin "mktute" "${nodejs}/bin/node ${node}/bin/mktute.js;";
          node = pkgs.buildNpmPackage {
            name = packageJSON.name;
            src = pkgs.fetchFromGitHub {
              owner = "josephrmartinez";
              repo = "mktute";
              rev = "670ea75f9927eeea5a2b15c048b694e95c94d709";
              sha256 = "sha256-aDSCBvBmaYykNLm1T7Ui4v8EZCaYnXETbqXKKgR64Wc=";
            };
            npmDepsHash = "sha256-JYBqbX/OOVclESNhomUZXaceq8jz3StoPyIyTmhc2fI=";
            npmBuildScript = "build:nix";
            dontNpmInstall = true;
            postInstall = ''mv $out/bin/mktute.cjs $out/bin/mktute.js'';
            meta = {
              description = packageJSON.description;
              license = packageJSON.license;
            };
          };
        };
        devShells = {
          default = pkgs.mkShell {
            out = ".";
            packages = [
              nodejs
              pkgs.prefetch-npm-deps
              pkgs.nodePackages.pnpm
            ];
            shellHook = "npm install; prefetch-npm-deps package-lock.json";
          };
        };
      }
    );
}
