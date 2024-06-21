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
            src = ./.;
            npmDepsHash = "sha256-FpDFFOoTgEc3UZ8NO9Kr5PsY73LO4xM7srfo/lCJCa8=";
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
