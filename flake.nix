{
  description = "Mktute";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        nodejs = pkgs.nodejs_18;
      in rec {
        devShells = {
          default = pkgs.mkShell {
            out = ".";
            packages = [ nodejs pkgs.prefetch-npm-deps pkgs.nodePackages.pnpm ];
            shellHook = "pnpm install; prefetch-npm-deps package-lock.json";
          };
        };
      });
}
